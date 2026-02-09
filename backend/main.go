package main

import (
	"math/rand"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)


// Organism represents a single node in the bio tree
type Organism struct {
	ID        int       `json:"id"`
	Fertility float64   `json:"fertility"`
	Children  []Organism `json:"children"`
}

// Request body for generating children
type GenerateRequest struct {
	ParentFertility float64 `json:"parent_fertility"`
}

var idCounter = 1

// Use local RNG instance instead of global rand
// so it can be controlled or replaced later if needed
var rng = rand.New(rand.NewSource(time.Now().UnixNano()))


// generateChildren creates child organisms based on parent fertility.
// It tries up to 10 times and stops when a reproduction attempt fails.
func generateChildren(parentFertility float64) []Organism {
	children := []Organism{}

	for i := 0; i < 10; i++ {
		r := rng.Float64() * 100

		if r <= parentFertility {
			divisor := rng.Float64() * 100 * 10
			if divisor == 0 {
				divisor = 0.01
			}

			childFertility := parentFertility / divisor

			child := Organism{
				ID:        idCounter,
				Fertility: childFertility,
				Children:  []Organism{},
			}
			idCounter++

			children = append(children, child)
		} else {
			// stop when one attempt fails
			break
		}
	}

	return children
}

func main() {
	r := gin.Default()
	r.Use(cors.Default())

	r.POST("/api/generate-organism", func(c *gin.Context) {
		var req GenerateRequest
		c.BindJSON(&req)

		children := generateChildren(req.ParentFertility)

		c.JSON(200, children)
	})

	r.Run(":8080")
}
