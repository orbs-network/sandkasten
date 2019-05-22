package main

import (
	"github.com/orbs-network/orbs-contract-sdk/go/testing/unit"
	"github.com/stretchr/testify/require"
	"testing"
)

func TestEmptyStateReturnsEmptyJson(t *testing.T) {
	unit.InServiceScope([]byte{}, []byte{}, func(mockery unit.Mockery) {
		require.Equal(t, []byte("null"), readStates(), "initial state wasn't an empty json")
	})
}

func TestEmptyStateIsAnEmptySlice(t *testing.T) {
	unit.InServiceScope([]byte{}, []byte{}, func(mockery unit.Mockery) {
		require.Nil(t, getStates(), "initial state wasn't empty")
	})
}
