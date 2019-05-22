package main

import "encoding/json"
import "github.com/orbs-network/orbs-contract-sdk/go/sdk/v1/state"

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

	states := getStates()
	if len(states) > 0 {
		lastState := states[len(states)-1]
		for k, v := range lastState {
			newState[k] = v
		}
	}

	newState[string(key)] = value

	setStates(append(states, newState))
}

func setStates(revisions stateRevisions) {
	stateJson, err := json.Marshal(revisions)
	if err != nil {
		panic(err)
	}
	state.WriteBytes(STATES_KEY, stateJson)
}

func getStates() (states stateRevisions) {
	if err := json.Unmarshal(readStates(), &states); err != nil {
		panic(err)
	}
	return
}

func readStates() []byte {
	if bytes := state.ReadBytes(STATES_KEY); len(bytes) == 0 {
		return []byte("null")
	} else {
		return bytes
	}
}

func goebbelsReadProxiedState() []byte {
	return readStates()
}
