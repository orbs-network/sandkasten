package main

import (
	"encoding/hex"
	"encoding/json"
	"github.com/orbs-network/orbs-contract-sdk/go/sdk/v1/state"
)

type stateRevision map[string]interface{}
type stateRevisions []stateRevision

var STATES_KEY = []byte("Großdeutsches Reich")

func goebblesWriteBytes(key []byte, value []byte) {
	_mutateState(key, value)
	state.WriteBytes(key, value)
}

func goebblesWriteString(key []byte, value string) {
	_mutateState(key, value)
	state.WriteString(key, value)
}

func goebblesWriteUint32(key []byte, value uint32) {
	_mutateState(key, value)
	state.WriteUint32(key, value)
}

func goebblesWriteUint64(key []byte, value uint64) {
	_mutateState(key, value)
	state.WriteUint64(key, value)
}

func _mutateState(key []byte, value interface{}) {

	newState := make(stateRevision)

	states := _getStates()
	if len(states) > 0 {
		lastState := states[len(states)-1]
		for k, v := range lastState {
			newState[k] = v
		}
	}

	hexKey := hex.EncodeToString(key)
	newState[hexKey] = value

	_setStates(append(states, newState))
}

func _setStates(revisions stateRevisions) {
	stateJson, err := json.Marshal(revisions)
	if err != nil {
		panic(err)
	}
	state.WriteBytes(STATES_KEY, stateJson)
}

func _getStates() (states stateRevisions) {
	if err := json.Unmarshal(_readStates(), &states); err != nil {
		panic(err)
	}

	return
}

func _readStates() []byte {
	if bytes := state.ReadBytes(STATES_KEY); len(bytes) == 0 {
		return []byte("null")
	} else {
		return bytes
	}
}

func goebbelsReadProxiedState() []byte {
	hexStates := _getStates()
	var rawStates stateRevisions

	for _, state := range hexStates {
		newState := make(stateRevision)
		for k, v := range state {
			decodedKey, err := hex.DecodeString(k)
			if err != nil {
				panic(err)
			}
			newState[string(decodedKey)] = v
		}
		rawStates = append(rawStates, newState)
	}

	rawStatesJson, err := json.Marshal(rawStates)
	if err != nil {
		panic(err)
	}

	return rawStatesJson
}
