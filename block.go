package main

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"
)

//Block represents a block candidate
type Block struct {
	index                uint32
	transactionsIncluded uint32
	difficulty           uint32
	expectedReward       uint64
	rewardAddress        string
	blockDataHash        string
	dateCreated          string
	nonce                uint32
}

func (b *Block) addNonce() {
	var mutex sync.Mutex
	mutex.Lock()
	b.nonce++
	mutex.Unlock()
}

func (b *Block) mine(channel chan bool) {
	for !b.validProof() {
		b.addNonce()
	}
}

//Hash returns a sha256 hash string of the block data
func (b *Block) Hash() string {
	json, _ := json.Marshal(map[string]interface{}{
		"blockDataHash": b.blockDataHash,
		"dateCreated":   b.dateCreated,
		"nonce":         b.nonce,
	})
	hasher := sha256.New()
	hasher.Write(json)

	return hex.EncodeToString(hasher.Sum(nil))

}

func (b *Block) validProof() bool {
	return strings.Repeat("0", int(b.difficulty)) == string(b.Hash()[:b.difficulty])
}

//SubmitBlock send the mined block to the node
func (b *Block) SubmitBlock(host string) {
	data, _ := json.Marshal(map[string]interface{}{
		"blockDataHash": b.blockDataHash,
		"dateCreated":   b.dateCreated,
		"blockHash":     b.Hash(),
		"nonce":         b.nonce,
	})
	resp, _ := http.Post(host+"/mining/submit-mined-block", "application/json",
		bytes.NewBuffer(data))

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)
	fmt.Printf("%v\n", result["message"])
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
		expectedReward:       uint64(result["expectedReward"].(float64)),
		rewardAddress:        result["rewardAddress"].(string),
		blockDataHash:        result["blockDataHash"].(string),
		dateCreated:          time.Now().UTC().Format(time.RFC3339),
	}, nil
}
