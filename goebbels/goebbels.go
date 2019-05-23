package main

import (
	"flag"
	"fmt"
	"io/ioutil"
	"strings"
)

var requiredImports = []string {
	"encoding/hex",
	"encoding/json",
	"errors",
	"github.com/orbs-network/orbs-contract-sdk/go/sdk/v1/events",
	"github.com/orbs-network/orbs-contract-sdk/go/sdk/v1/state",
	"reflect",
	"runtime",
	"strings",
}

// usage: go run goebbels.go -contract <input-contract.go> -output <decorated-contract.go>
func main() {
	contractFileName := flag.String("contract", "", "path to contract file to decorate")
	outFileName := flag.String("output", "", "path to output file")

	flag.Parse()

	if *contractFileName == "" {
		panic("input contract name not set")
	}

	if *outFileName == "" {
		panic("output contract name not set")
	}

	code,err := ioutil.ReadFile(*contractFileName)
	if err != nil {
		panic("cannot find orbs code")
	}

	if err = ioutil.WriteFile(*outFileName, []byte(decorate(string(code))), 0644); err != nil {
		panic(err)
	}
}

func decorate(undecorated string) string {
	decoratedWithState := replaceAllStateWritesWithProxy(undecorated)
	decoratedWithEvents := replaceAllEmitEventWithProxy(decoratedWithState)

	decoratedWithTheNazi := injectInstrumentationCode(decoratedWithEvents) // appends code and adds it to PUBLIC

	return decoratedWithTheNazi
}

func injectInstrumentationCode(decorated string) string {
	withPublic := strings.Replace(decorated,
		"var PUBLIC = sdk.Export(",
		"var PUBLIC = sdk.Export(goebbelsReadProxiedState, goebbelsReadProxiedEvents, ",
		1)

	withGoebbelsJsonImport := injectImports(withPublic)

	f, err := ioutil.ReadFile("./sdk_proxy.go")
	if err != nil {
		panic("could not find state proxy")
	}
	lines := strings.Split(string(f), "\n")

	goebbelsWrites := strings.Join(lines[12:], "\n")

	withGoebbelsJsonImport += goebbelsWrites
	return withGoebbelsJsonImport
}

func injectImports(code string) string {
	importStartLoc := strings.Index(code, "import (")
	importEndLoc := strings.Index(code, ")")
	for _, imp := range requiredImports {
		loc := strings.Index(code, imp)
		if loc == -1 || loc > importEndLoc || loc < importStartLoc {
			// import string not in import block, inject
			code = strings.Replace(code, "import (", fmt.Sprintf("import (\n\t\"%s\"", imp), 1)
			importEndLoc = strings.Index(code, ")")
		}
	}

	return code
}

func replaceAllStateWritesWithProxy(code string) string {
	return strings.Replace(code, "state.Write", "goebblesWrite", -1)
}

func replaceAllEmitEventWithProxy(code string) string {
	return strings.Replace(code, "events.EmitEvent", "goebblesEmitEvent", -1)
}