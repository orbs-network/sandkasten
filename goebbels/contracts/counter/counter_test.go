package main

import (
	"github.com/orbs-network/orbs-contract-sdk/go/testing/unit"
	"github.com/stretchr/testify/require"
	"testing"
)

func TestCounterInitialStateIsZero(t *testing.T) {
	unit.InSystemScope(nil, nil, func(mockery unit.Mockery) {
		require.EqualValues(t, 0, get())
	})
}

func TestCounterStateMutatesAfterAdd(t *testing.T) {
	unit.InSystemScope(nil, nil, func(mockery unit.Mockery) {
		add(17)
		require.EqualValues(t, 17, get())
	})
}
