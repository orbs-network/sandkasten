package main

import (
	"flag"
	"io/ioutil"
	"strings"
)


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

