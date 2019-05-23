package main

import (
	"github.com/stretchr/testify/require"
	"testing"
)

func TestIntrospectErc20(t *testing.T) {
	methods, err := introspect("../goebbels/contracts/erc20/erc20.go")
	require.NoError(t, err, "introspect")

	// totalSupply, balanceOf, allowance, increaseAllowance, decreaseAllowance, transfer, approve, transferFrom, symbol, name, decimals
	require.Len(t, methods, 11, "did not contain all expected method")

	totalSupply := find(methods, "totalSupply")
	require.NotNil(t, totalSupply, "couldn't find totalSupply")
	require.Len(t, totalSupply.Args, 0, "totalSupply didn't have 0 args")

	balanceOf := find(methods, "balanceOf")
	require.NotNil(t, balanceOf, "couldn't find balanceOf")
	require.Len(t, balanceOf.Args, 1, "balanceOf didn't have 1 arg")

}

func find(methods []methodData, name string) *methodData {
	for _, method := range methods {
		if method.Name == name {
			return &method
		}
	}

	return nil
}
