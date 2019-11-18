package main

import (
	"flag"
	"fmt"
	"runtime"
	"sync"
)

func main() {
	host := flag.String("h", "http://localhost:5555", "Node url")
	cpu := flag.Int("cpu", runtime.NumCPU(), "Cpu count")

	flag.Parse()

	if *cpu > runtime.NumCPU() {
		*cpu = runtime.NumCPU()
	}

	runtime.GOMAXPROCS(*cpu)
	fmt.Printf("Using %d CPU\n", *cpu)

	// for {
	channel := make(chan bool)
	var wg sync.WaitGroup
	wg.Add(10)

	block, err := requestBlock(*host)

	if err != nil {
		println("Error on mining job request")
		panic(err.Error())
	}

	fmt.Printf("Mining block #%d\n", block.index)

	for i := 0; i < 10; i++ {
		go func() {
			defer wg.Done()
			block.mine(channel)
		}()
	}

	wg.Wait()
	block.SubmitBlock(*host)
	// }
}
