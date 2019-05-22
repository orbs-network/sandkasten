package main

import (
	"bytes"
	"encoding/gob"
	"encoding/hex"
	"encoding/json"
	"errors"
	"github.com/orbs-network/orbs-contract-sdk/go/sdk/v1/events"
	"github.com/orbs-network/orbs-contract-sdk/go/sdk/v1/state"
	"reflect"
	"runtime"
	"strings"
)

type stateRevision map[string]interface{}
type stateRevisions []stateRevision

type eventRecord struct
{
	functionName string
	args [][]byte
}
type eventRecords []eventRecord

var STATES_KEY = []byte("Großdeutsches Reich")
var EVENTS_KEY = []byte("Reichskommissariat Gebiete")

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

func goebblesEmitEvent(eventFunctionSignature interface{}, args ...interface{}) {
	_mutateEvents(eventFunctionSignature, args...)
	events.EmitEvent(eventFunctionSignature, args...)
}

func _mutateEvents(sig interface{}, args ...interface{}) {
	functionName, err := GetContractMethodNameFromFunction(sig)
	if err != nil {
		panic(err)
	}

	newEvent := eventRecord{
		functionName:functionName,
		args:argsToArgumentArray(args),
	}

	events := _getEvents()

	_setEvents(append(events, newEvent))
}

func _setEvents(events eventRecords) {
	stateJson, err := json.Marshal(events)
	if err != nil {
		panic(err)
	}
	state.WriteBytes(EVENTS_KEY, stateJson)
}

func _getEvents() (events eventRecords) {
	if err := json.Unmarshal(_readStates(), &events); err != nil {
		panic(err)
	}

	return
}

func goebbelsReadProxiedEvents() (eventsJson []byte) {
	eventsJson, err := json.Marshal(_getEvents()	)
	if err != nil {
		panic(err)
	}
	return
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

func GetContractMethodNameFromFunction(function interface{}) (string, error) {
	v := reflect.ValueOf(function)
	if v.Kind() != reflect.Func {
		return "", errors.New("did not receive a valid function")
	}

	fullPackageName := runtime.FuncForPC(v.Pointer()).Name()
	parts := strings.Split(fullPackageName, ".")
	if len(parts) == 0 {
		return "", errors.New("function name does not contain a valid package name")
	} else {
		return parts[len(parts)-1], nil
	}
}


func argsToArgumentArray(args ...interface{}) [][]byte {
	res := make([][]byte, len(args))
	for i, arg := range args {
		rawBytes, err := GetBytes(arg)
		if err != nil {
			panic(err)
		}

		res[i] = append(res[i], rawBytes...)
		}

	return res
}

func GetBytes(key interface{}) ([]byte, error) {
	var buf bytes.Buffer
	enc := gob.NewEncoder(&buf)
	err := enc.Encode(key)
	if err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}