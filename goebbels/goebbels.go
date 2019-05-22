package main

import (
	"io/ioutil"
	"strings"
)

func main() {
	code,err := ioutil.ReadFile("counter.go")
	if err != nil {
		panic("cannot find orbs code")
	}

	withgoe := decorate(string(code))

	ioutil.WriteFile("./decorated_counter.go", []byte(withgoe), 0644)
}

func decorate(undecorated string) string {
	decorated := replaceAllStateWritesWithProxy(undecorated)

	decorated = injectInstrumentationCode(decorated) // appends code and adds it to PUBLIC

	return decorated
}

func injectInstrumentationCode(decorated string) string {
	withPublic := strings.Replace(decorated,
		"var PUBLIC = sdk.Export(",
		"var PUBLIC = sdk.Export(goebbelsReadProxiedState, ",
		1)

	withgoebbelsJsonImport := strings.Replace(withPublic,
		"import (",
		"import (\"encoding/json\"",
		1)

	f, err := ioutil.ReadFile("./state_proxy.go")
	if err != nil {
		panic("could not find state proxy")
	}
	lines := strings.Split(string(f), "\n")

	goebbelsWrites := strings.Join(lines[4:], "\n")

	withgoebbelsJsonImport += goebbelsWrites
	return withgoebbelsJsonImport
}

func replaceAllStateWritesWithProxy(code string) string {
	return strings.Replace(code, "state.Write", "goebblesWrite", -1)
}

