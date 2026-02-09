import { useState } from "react"
import axios from "axios"

function TreeNode({ node, onGenerate }) {
  return (
    <div className="ml-6 mt-2 border-l pl-3">
      <div className="flex items-center gap-4 text-sm">
        <div>
          <span className="font-medium">ID:</span> {node.id}
          <span className="ml-3 font-medium">Fertility:</span>{" "}
          {node.fertility.toFixed(4)}
        </div>

        <button
          onClick={() => onGenerate(node)}
          className="text-xs text-blue-600 hover:underline"
        >
          generate
        </button>
      </div>

      <div className="mt-1">
        {node.children.map(child => (
          <TreeNode
            key={child.id}
            node={child}
            onGenerate={onGenerate}
          />
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [fertility, setFertility] = useState(50)
  const [root, setRoot] = useState(null)

  // Create the root and immediately generate its first generation
  const addRoot = async () => {
    const rootNode = {
      id: 1,
      fertility: Number(fertility),
      children: []
    }

    const res = await axios.post("http://localhost:8080/api/generate-organism", {
      parent_fertility: rootNode.fertility
    })

    rootNode.children = res.data
    setRoot(rootNode)
  }

  // Create a new tree with updated children (immutable update)
  const updateNode = (current, targetId, newChildren) => {
    if (current.id === targetId) {
      return {
        ...current,
        children: newChildren
      }
    }

    return {
      ...current,
      children: current.children.map(child =>
        updateNode(child, targetId, newChildren)
      )
    }
  }

  // Generate children for any selected node
  const generateChildren = async (node) => {
    const res = await axios.post("http://localhost:8080/api/generate-organism", {
      parent_fertility: node.fertility
    })

    const newTree = updateNode(root, node.id, res.data)
    setRoot(newTree)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl font-semibold mb-4">
          Bio Tree Simulator
        </h1>

        <div className="flex items-center gap-2 mb-6">
          <label className="text-sm text-gray-600">
            Initial fertility
          </label>

          <input
            type="number"
            value={fertility}
            onChange={e => setFertility(e.target.value)}
            className="border px-2 py-1 w-28 text-sm rounded"
          />

          <button
            onClick={addRoot}
            className="bg-gray-800 text-white px-3 py-1 text-sm rounded hover:bg-gray-700"
          >
            Add root
          </button>
        </div>

        {root && (
          <div className="bg-white border p-4">
            <TreeNode node={root} onGenerate={generateChildren} />
          </div>
        )}
      </div>
    </div>
  )
}
