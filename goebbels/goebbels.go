package main

import (
	"strings"
)

func decorate(undecorated string) string {
	decorated := replaceAllStateWritesWithProxy(undecorated)

	decorated += instrumentationCode // appends code and adds it to PUBLIC

	return decorated
}

func replaceAllStateWritesWithProxy(code string) string {
	return strings.Replace(code, "state.Write", "goebblesWrite", -1)
}

