package main

import (
	"github.com/orbs-network/orbs-contract-sdk/go/testing/unit"
	"github.com/stretchr/testify/require"
	"testing"
)

func TestCounterInit(t *testing.T) {
	unit.InSystemScope([]byte{}, []byte{}, func(mockery unit.Mockery) {
		require.NotPanics(t, func() {
			_init()
		})
	})
}
