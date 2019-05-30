const { FileManager } = require('./file-manager');
const { ContractManager } = require('./contract-manager');
const { expect } = require('chai');

describe('contract manager', () => {
  it('runs tests for a non-broken contract and reports ok', async () => {
    const files = new FileManager();
    const contracts = new ContractManager(files);

    const counter = files.load('counter');
    counter.code = `
package main

import (
\t"github.com/orbs-network/orbs-contract-sdk/go/sdk/v1"
\t"github.com/orbs-network/orbs-contract-sdk/go/sdk/v1/state"
)

var PUBLIC = sdk.Export(add, get)
var SYSTEM = sdk.Export(_init)

var COUNTER_KEY = []byte("count")

func _init() {
\tstate.WriteUint64(COUNTER_KEY, 0)
}

func add(amount uint64) {
\tcount := state.ReadUint64(COUNTER_KEY)
\tcount += amount
\tstate.WriteUint64(COUNTER_KEY, count)
}

func get() uint64 {
\treturn state.ReadUint64(COUNTER_KEY)
}       
       `;

    files.save(counter);

    const counterTest = files.load('counter_test');
    counterTest.code = `
package main

import (
\t"github.com/orbs-network/orbs-contract-sdk/go/testing/unit"
\t"github.com/stretchr/testify/require"
\t"testing"
)

func TestCounterInit(t *testing.T) {
\tunit.InSystemScope([]byte{}, []byte{}, func(mockery unit.Mockery) {
\t\trequire.NotPanics(t, func() {
\t\t\t_init()
\t\t})
\t})
}       
`;

    files.save(counterTest);

    const result = await contracts.runTest(counterTest.name);
    expect(result.stderr).to.empty;
    expect(result.success).to.be.true;
  });

  it('runs a broken test and reports failure', async () => {
    const files = new FileManager();
    const contracts = new ContractManager(files);

    const counter = files.load('counter');
    counter.code = `
package main

import (
\t"github.com/orbs-network/orbs-contract-sdk/go/sdk/v1"
\t"github.com/orbs-network/orbs-contract-sdk/go/sdk/v1/state"
)

var PUBLIC = sdk.Export(add, get)
var SYSTEM = sdk.Export(_init)

var COUNTER_KEY = []byte("count")

func _init() {
\tstate.WriteUint64(COUNTER_KEY, 0)
}

func add(amount uint64) {
\tcount := state.ReadUint64(COUNTER_KEY)
\tcount += amount
\tstate.WriteUint64(COUNTER_KEY, count)
}

func get() uint64 {
\treturn state.ReadUint64(COUNTER_KEY)
}       
       `;

    files.save(counter);

    const counterTest = files.load('counter_test');
    counterTest.code = `
package main

import (
\t"github.com/orbs-network/orbs-contract-sdk/go/testing/unit"
\t"github.com/stretchr/testify/require"
\t"testing"
)

func TestCounterInit(t *testing.T) {
\tunit.InSystemScope([]byte{}, []byte{}, func(mockery unit.Mockery) {
\t\trequire.NotPanics(t, func() {
\t\t\t_init()
\t\t})
\t})
}  

func TestThisOneShouldFail(t *testing.T) {
\tunit.InSystemScope([]byte{}, []byte{}, func(mockery unit.Mockery) {
\t\trequire.Panics(t, func() {
\t\t\t_init()
\t\t})
\t})
}       
`;

    files.save(counterTest);

    const result = await contracts.runTest(counterTest.name);
    expect(result.success).to.be.false;
    console.log(result.stdout);
  });
});
