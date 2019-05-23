module.exports = `
package main

import (
\t"github.com/orbs-network/orbs-contract-sdk/go/testing/unit"
\t"github.com/stretchr/testify/require"
\t"testing"
)

func TestCounterInitialStateIsZero(t *testing.T) {
\tunit.InSystemScope(nil, nil, func(mockery unit.Mockery) {
\t\trequire.EqualValues(t, 0, get())
\t})
}

func TestCounterStateMutatesAfterAdd(t *testing.T) {
\tunit.InSystemScope(nil, nil, func(mockery unit.Mockery) {
\t\tadd(17)
\t\trequire.EqualValues(t, 17, get())
\t})
}
`
