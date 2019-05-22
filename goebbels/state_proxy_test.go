package main

import (
	"encoding/hex"
	"github.com/orbs-network/orbs-contract-sdk/go/testing/unit"
	"github.com/stretchr/testify/require"
	"testing"
)

func TestInit(t *testing.T) {
	unit.InSystemScope([]byte{}, []byte{}, func(mockery unit.Mockery) {
		require.NotPanics(t, func() {
			_mutateState([]byte("count"), 0)
		})
	})
}

func TestEmptyStateReturnsEmptyJson(t *testing.T) {
	unit.InServiceScope([]byte{}, []byte{}, func(mockery unit.Mockery) {
		require.Equal(t, []byte("null"), _readStates(), "initial state wasn't an empty json")
	})
}

func TestEmptyStateIsAnEmptySlice(t *testing.T) {
	unit.InServiceScope([]byte{}, []byte{}, func(mockery unit.Mockery) {
		require.Nil(t, _getStates(), "initial state wasn't empty")
	})
}

func TestSetStatesCanSaveAnEmptyState(t *testing.T) {
	unit.InServiceScope([]byte{}, []byte{}, func(mockery unit.Mockery) {
		require.NotPanics(t, func() { _setStates(nil) })
	})
}

func TestSetStatesCanSaveANonEmptyState(t *testing.T) {
	unit.InServiceScope([]byte{}, []byte{}, func(mockery unit.Mockery) {
		_setStates(stateRevisions{
			stateRevision{
				"A": 1,
			},
		})

		lastState := _getStates()[0]

		require.EqualValues(t, 1, lastState["A"], "state did not contain expected value")
	})
}

func TestMutateStateAppendsKeysToState(t *testing.T) {
	unit.InServiceScope([]byte{}, []byte{}, func(mockery unit.Mockery) {

		_mutateState([]byte("A"), 1)
		_mutateState([]byte("B"), 2)
		_mutateState([]byte("A"), 3)

		s0 := _getStates()[0]
		s1 := _getStates()[1]
		s2 := _getStates()[2]

		require.EqualValues(t, 1, s0["41"], "state 0 did not contain expected value")
		require.EqualValues(t, 1, s1["41"], "state 1 did not contain expected value")
		require.EqualValues(t, 2, s1["42"], "state 1 did not contain expected value")
		require.EqualValues(t, 3, s2["41"], "state 2 did not contain expected value")
		require.EqualValues(t, 2, s2["42"], "state 2 did not contain expected value")
	})
}

func TestStateKeysWithWeirdByteValues(t *testing.T) {
	unit.InServiceScope([]byte{}, []byte{}, func(mockery unit.Mockery) {

		rawBytes, err := hex.DecodeString("7ec33f886a0E60a29d4FF9A6C9B33AF8f0e217D4")
		if err != nil {
			t.Fatal(err)
		}

		_mutateState(rawBytes, 1)
		_mutateState(rawBytes, 2)

		s0 := _getStates()[0]
		s1 := _getStates()[1]

		require.EqualValues(t, 1, s0["7ec33f886a0e60a29d4ff9a6c9b33af8f0e217d4"], "state 0 did not contain expected value")
		require.EqualValues(t, 2, s1["7ec33f886a0e60a29d4ff9a6c9b33af8f0e217d4"], "state 1 did not contain expected value")
	})
}