package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"path"
	"runtime"
	"sync"
)

var (
	account map[string]string
)

func main() {
	host := flag.String("h", "http://localhost:5555", "Node url")
	cpu := flag.Int("cpu", runtime.NumCPU(), "Cpu count")

	flag.Parse()
	checkAccountFile()

	loadAccount()

	if *cpu > runtime.NumCPU() {
		*cpu = runtime.NumCPU()
	}

	runtime.GOMAXPROCS(*cpu)
	fmt.Printf("Using %d CPU\n", *cpu)

	for {
		var wg sync.WaitGroup
		wg.Add(10)

		block, err := requestBlock(*host) // request block candidate
		if err != nil {
			println("Error on mining job request")
			panic(err.Error())
		}

		fmt.Printf("\033[44mMining block #%d\033[0m\n", block.index)

		mutex := new(sync.Mutex)
		once := new(sync.Once)

		for i := 0; i < 10; i++ {
			go func() {
				defer wg.Done()
				block.mine(*host, mutex, once)
			}()
		}

		wg.Wait()
	}
}

func checkAccountFile() {
	// execPath, _ := exec.LookPath(os.Args[0])
	dir, _ := /* filepath.Abs(execPath) */ os.Getwd()
	if _, err := os.Stat(path.Join(dir, "account.json")); os.IsNotExist(err) {
		exec.Command("node", path.Join(dir, "generateAccount.js")).Run()
	}
}

func loadAccount() {
	// execPath, _ := exec.LookPath(os.Args[0])
	dir, _ := /* filepath.Abs(execPath) */ os.Getwd()
	jsonFile, _ := os.Open(path.Join(dir, "account.json"))
	defer jsonFile.Close()

	byteValue, _ := ioutil.ReadAll(jsonFile)

	json.Unmarshal(byteValue, &account)

}
