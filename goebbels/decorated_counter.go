package main

import ("encoding/json"
	"github.com/orbs-network/orbs-contract-sdk/go/sdk/v1"
	"github.com/orbs-network/orbs-contract-sdk/go/sdk/v1/state"
)

var PUBLIC = sdk.Export(goebbelsReadProxiedState, add, get)
var SYSTEM = sdk.Export(_init)

var COUNTER_KEY = []byte("count")

func _init() {
	goebblesWriteUint64(COUNTER_KEY, 0)
}

func add(amount uint64) {
	count := state.ReadUint64(COUNTER_KEY)
	count += amount
	goebblesWriteUint64(COUNTER_KEY, count)
}

func get() uint64 {
	return state.ReadUint64(COUNTER_KEY)
}
type stateRevision map[string]interface{}
type stateRevisions []stateRevision

var states stateRevisions

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

	if len(states) > 0 {
		lastState := states[len(states) - 1]
		for k, v := range lastState {
			newState[k] = v
		}
	}

	newState[string(key)] = value
	states = append(states, newState)
}

func goebbelsReadProxiedState() []byte {
	j, _ := json.Marshal(states)
	return j
}
