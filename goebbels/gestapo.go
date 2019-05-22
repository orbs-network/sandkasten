package main

import (
	"encoding/json"
	"flag"
	"go/ast"
	"go/parser"
	"go/token"
	"io/ioutil"
)

type argData struct {
	Name string
	Type string
}

type methodData struct {
	Name string
	Args []argData
}

// prints json with AST data for contract; usage: go run gestapo.go -contract <contract-name.go>
func main2() {
	contractFileName := flag.String("contract", "counter.go", "contract file to introspect")
	flag.Parse()

	if *contractFileName == "" {
		panic("input contract name not set")
	}

	code, err := ioutil.ReadFile(*contractFileName)
	if err != nil {
		panic("cannot find orbs code")
	}

	methods := extractPublicMethods(*contractFileName, code)

	json, err := json.Marshal(methods)
	if err != nil {
		panic(err)
	}

	println(string(json))
}

func extractPublicMethods(filename string, src []byte) (methods []methodData) {
	fset := token.NewFileSet() // positions are relative to fset
	fileAst, err := parser.ParseFile(fset, filename, src, parser.AllErrors)
	if err != nil {
		panic(err)
	}

	for _, d := range fileAst.Decls {
		switch decl := d.(type) {
		case *ast.GenDecl:
			for _, spec := range decl.Specs {
				switch spec := spec.(type) {
				case *ast.ValueSpec:
					for _, id := range spec.Names {
						if id.Name == "PUBLIC" {
							sdkExport := spec.Values[0]
							exportedFuncs := sdkExport.(*ast.CallExpr).Args

							for _, exportedFunc := range exportedFuncs {
								data := extractMethod(exportedFunc.(*ast.Ident).Obj)
								methods = append(methods, data)
							}
						}
					}
				}
			}
		}
	}

	return
}

func extractMethod(method *ast.Object) methodData {
	data := methodData{
		Name: method.Name,
		Args: extractArgs(method.Decl.(*ast.FuncDecl).Type.Params.List),
	}
	return data
}

func extractArgs(fields []*ast.Field) (args []argData) {
	for _, field := range fields {
		arg := argData{
			Name: field.Names[0].Name,
			Type: field.Type.(*ast.Ident).Name,
		}

		args = append(args, arg)
	}

	return
}
