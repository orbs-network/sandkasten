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
	require.Equal(t, "owner", balanceOf.Args[0].Name)
	require.Equal(t, "[]byte", balanceOf.Args[0].Type)

	transfer := find(methods, "transfer")
	require.NotNil(t, transfer, "couldn't find transfer")
	require.Len(t, transfer.Args, 2, "transfer didn't have 1 arg")
	require.Equal(t, "to", transfer.Args[0].Name)
	require.Equal(t, "[]byte", transfer.Args[0].Type)
	require.Equal(t, "value", transfer.Args[1].Name)
	require.Equal(t, "uint64", transfer.Args[1].Type)

}

func find(methods []methodData, name string) *methodData {
	for _, method := range methods {
		if method.Name == name {
			return &method
		}
	}

	return nil
}
