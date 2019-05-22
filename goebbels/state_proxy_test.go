package main

import (
	"github.com/orbs-network/orbs-contract-sdk/go/testing/unit"
	"github.com/stretchr/testify/require"
	"testing"
)

func TestEmptyStateReturnsEmptyJson(t *testing.T) {
	unit.InServiceScope([]byte{}, []byte{}, func(mockery unit.Mockery) {
		require.Equal(t, []byte("{}"), readStates(), "initial state wasn't an empty json")
	})
}
