package main

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"
)

//Block represents a block candidate
type Block struct {
	index                uint32
	transactionsIncluded uint32
	difficulty           uint32
	expectedReward       string
	rewardAddress        string
	blockDataHash        string
	dateCreated          string
	nonce                uint64
	mined                bool
}

func (b *Block) mine(host string, mutex *sync.Mutex, once *sync.Once) {
	for !b.mined {
		if block, ok := validProof(*b); ok {
			b.mined = true
			once.Do(func() {
				SubmitBlock(block, host)
			})
			return
		}
		mutex.Lock()
		b.nonce++
		b.dateCreated = time.Now().UTC().Format(time.RFC3339)
		mutex.Unlock()
	}
}

//Hash returns a sha256 hash string of the block data
func (b *Block) Hash() string {
	json, _ := json.Marshal(map[string]interface{}{
		"blockDataHash": b.blockDataHash,
		"dateCreated":   b.dateCreated,
		"nonce":         strconv.Itoa(int(b.nonce)),
	})

	hasher := sha256.New()
	hasher.Write(json)

	return hex.EncodeToString(hasher.Sum(nil))

}

func validProof(b Block) (Block, bool) {
	return b, strings.Repeat("0", int(b.difficulty)) == string(b.Hash()[:b.difficulty])
}

//SubmitBlock send the mined block to the node
func SubmitBlock(b Block, host string) {
	data, _ := json.Marshal(map[string]interface{}{
		"blockDataHash": b.blockDataHash,
		"dateCreated":   b.dateCreated,
		"blockHash":     b.Hash(),
		"nonce":         strconv.Itoa(int(b.nonce)),
	})
	resp, err := http.Post(host+"/mining/submit-mined-block", "application/json",
		bytes.NewBuffer(data))

	if err != nil {
		println(err.Error())
		return
	}

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)
	for key, message := range result {
		var color string
		if key == "errorMsg" {
			color = "\033[41m"
		} else {
			color = "\033[42m"
		}
		fmt.Printf("%vResult: %v\033[0m\n", color, message)
	}
}

func requestBlock(host string) (Block, error) {
	resp, err := http.Get(fmt.Sprintf("%s/mining/get-mining-job/%s", host, account["address"]))

	if err != nil {
		return Block{}, err
	}

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)
	return Block{
		index:                uint32(result["index"].(float64)),
		transactionsIncluded: uint32(result["transactionsIncluded"].(float64)),
		difficulty:           uint32(result["difficulty"].(float64)),
		expectedReward:       result["expectedReward"].(string),
		rewardAddress:        result["rewardAddress"].(string),
		blockDataHash:        result["blockDataHash"].(string),
		dateCreated:          time.Now().UTC().Format(time.RFC3339),
	}, nil
}
