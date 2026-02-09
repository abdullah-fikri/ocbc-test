import { useState } from "react"
import axios from "axios"

function TreeNode({ node, onGenerate }) {
  return (
    <div className="ml-6 mt-3 relative">
      <div className="absolute -left-3 top-0 bottom-0 w-px bg-gray-300"></div>

      <div className="bg-white shadow-sm border rounded-lg px-4 py-2 flex items-center justify-between hover:shadow-md transition">
        <div className="text-sm">
          <span className="font-semibold">ID:</span> {node.id}
          <span className="ml-3 font-semibold">Fertility:</span>{" "}
          <span className="text-blue-600">
            {node.fertility.toFixed(4)}
          </span>
        </div>

        <button
          onClick={() => onGenerate(node)}
          className="ml-4 px-3 py-1 bg-green-500 text-white text-xs rounded-md hover:bg-green-600"
        >
          Generate
        </button>
      </div>

      <div className="mt-2">
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

  // Create the root and immediately generate its first children
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

  // Recursively create a new tree with updated children
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

  // Generate children for any node
  const generateChildren = async (node) => {
    const res = await axios.post("http://localhost:8080/api/generate-organism", {
      parent_fertility: node.fertility
    })

    const newTree = updateNode(root, node.id, res.data)
    setRoot(newTree)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4 text-green-600">
          🌱 Bio-Tree Simulator
        </h2>

        <div className="flex gap-3 mb-6">
          <input
            type="number"
            value={fertility}
            onChange={e => setFertility(e.target.value)}
            className="border rounded-lg px-3 py-2 w-32 focus:ring focus:ring-green-200 outline-none"
          />

          <button
            onClick={addRoot}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Root
          </button>
        </div>

        {root && <TreeNode node={root} onGenerate={generateChildren} />}
      </div>
    </div>
  )
}
