const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');
const nodesInput = document.getElementById('nodes');
const generateGraphBtn = document.getElementById('generateGraph');
const startDFSBtn = document.getElementById('startDFS');
const resetGraphBtn = document.getElementById('resetGraph');
const outputParagraph = document.getElementById('output');

let numNodes;
let nodes = []; // Array of {x, y, radius, color}
let adjList = new Map(); // Adjacency list
let visited = new Set();
let traversalOrder = [];
let animationSpeed = 500; // Milliseconds

// Adjust canvas size to fit container
function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    if (nodes.length > 0) {
        drawGraph();
    }
}

window.addEventListener('resize', resizeCanvas);

// Node properties
const NODE_RADIUS = 20;
const NODE_COLOR = '#3498db'; // Bright blue
const VISITED_COLOR = '#2ecc71'; // Green
const EXPLORING_COLOR = '#f39c12'; // Orange
const TEXT_COLOR = '#ecf0f1';

// Edge properties
const EDGE_COLOR = '#7f8c8d'; // Grey
const ACTIVE_EDGE_COLOR = '#9b59b6'; // Purple

function drawNode(node, label) {
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    ctx.fillStyle = node.color;
    ctx.fill();
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = TEXT_COLOR;
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, node.x, node.y);
}

function drawEdge(node1, node2, color = EDGE_COLOR) {
    ctx.beginPath();
    ctx.moveTo(node1.x, node1.y);
    ctx.lineTo(node2.x, node2.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawGraph() {
    clearCanvas();

    // Draw edges first so nodes appear on top
    for (let [nodeIndex, neighbors] of adjList) {
        const node1 = nodes[nodeIndex];
        for (let neighborIndex of neighbors) {
            const node2 = nodes[neighborIndex];
            // Draw each edge only once for undirected graph
            if (nodeIndex < neighborIndex) {
                drawEdge(node1, node2);
            }
        }
    }

    // Draw nodes
    nodes.forEach((node, index) => {
        drawNode(node, index);
    });
}

function generateRandomGraph() {
    numNodes = parseInt(nodesInput.value);
    if (isNaN(numNodes) || numNodes < 2 || numNodes > 15) {
        alert('Please enter a number of nodes between 2 and 15.');
        nodesInput.value = 5;
        numNodes = 5;
    }

    nodes = [];
    adjList.clear();
    visited.clear();
    traversalOrder = [];
    outputParagraph.textContent = '';

    // Generate random node positions
    for (let i = 0; i < numNodes; i++) {
        let x, y, overlap;
        do {
            overlap = false;
            x = Math.random() * (canvas.width - 2 * NODE_RADIUS) + NODE_RADIUS;
            y = Math.random() * (canvas.height - 2 * NODE_RADIUS) + NODE_RADIUS;

            // Check for overlap with existing nodes
            for (let j = 0; j < nodes.length; j++) {
                const existingNode = nodes[j];
                const dist = Math.sqrt((x - existingNode.x)**2 + (y - existingNode.y)**2);
                if (dist < 2.5 * NODE_RADIUS) { // Ensure sufficient spacing
                    overlap = true;
                    break;
                }
            }
        } while (overlap);

        nodes.push({ x, y, radius: NODE_RADIUS, color: NODE_COLOR });
        adjList.set(i, []);
    }

    // Generate random edges (ensure connectivity for small graphs)
    // Simple approach: connect each node to at least one other node
    for (let i = 0; i < numNodes; i++) {
        let numEdges = Math.floor(Math.random() * 2) + 1; // 1 or 2 edges per node initially
        for (let j = 0; j < numEdges; j++) {
            let neighbor = Math.floor(Math.random() * numNodes);
            if (i !== neighbor && !adjList.get(i).includes(neighbor)) {
                adjList.get(i).push(neighbor);
                adjList.get(neighbor).push(i); // Undirected graph
            }
        }
    }

    // Ensure graph is connected (simple BFS check for small graphs)
    const checkConnectivity = () => {
        const q = [0];
        const visitedConnected = new Set([0]);
        let head = 0;

        while(head < q.length) {
            const u = q[head++];
            for (const v of adjList.get(u)) {
                if (!visitedConnected.has(v)) {
                    visitedConnected.add(v);
                    q.push(v);
                }
            }
        }
        return visitedConnected.size === numNodes;
    };

    // If not connected, add more random edges until it is
    let attempts = 0;
    const MAX_ATTEMPTS = 100;
    while (!checkConnectivity() && attempts < MAX_ATTEMPTS) {
        const node1 = Math.floor(Math.random() * numNodes);
        let node2 = Math.floor(Math.random() * numNodes);
        if (node1 !== node2 && !adjList.get(node1).includes(node2)) {
            adjList.get(node1).push(node2);
            adjList.get(node2).push(node1);
        }
        attempts++;
    }

    drawGraph();
    startDFSBtn.disabled = false;
}

async function dfs(nodeIndex, parentIndex = -1) {
    visited.add(nodeIndex);
    traversalOrder.push(nodeIndex);

    // Highlight current node as exploring
    nodes[nodeIndex].color = EXPLORING_COLOR;
    drawGraph();
    outputParagraph.textContent = 'Current: ' + traversalOrder.join(' -> ');
    await new Promise(resolve => setTimeout(resolve, animationSpeed));

    for (const neighborIndex of adjList.get(nodeIndex)) {
        if (!visited.has(neighborIndex)) {
            // Highlight active edge
            drawEdge(nodes[nodeIndex], nodes[neighborIndex], ACTIVE_EDGE_COLOR);
            drawNode(nodes[nodeIndex], nodeIndex); // Redraw current node to keep color
            drawNode(nodes[neighborIndex], neighborIndex); // Redraw neighbor node
            await new Promise(resolve => setTimeout(resolve, animationSpeed));

            await dfs(neighborIndex, nodeIndex);

            // After returning from recursion, highlight edge again (backtrack effect)
            drawEdge(nodes[nodeIndex], nodes[neighborIndex], ACTIVE_EDGE_COLOR);
            drawNode(nodes[nodeIndex], nodeIndex); // Redraw current node
            drawNode(nodes[neighborIndex], neighborIndex); // Redraw neighbor
            await new Promise(resolve => setTimeout(resolve, animationSpeed));
        }
    }

    // Mark node as fully visited
    nodes[nodeIndex].color = VISITED_COLOR;
    drawGraph();
    outputParagraph.textContent = 'Current: ' + traversalOrder.join(' -> ');
    await new Promise(resolve => setTimeout(resolve, animationSpeed));
}

async function startDFSVisualization() {
    startDFSBtn.disabled = true;
    generateGraphBtn.disabled = true;
    resetGraphBtn.disabled = true;

    visited.clear();
    traversalOrder = [];
    outputParagraph.textContent = '';

    // Reset node colors for new DFS run
    nodes.forEach(node => node.color = NODE_COLOR);
    drawGraph();

    // Start DFS from node 0 (can be made configurable)
    if (numNodes > 0) {
        await dfs(0);
    } else {
        alert('Please generate a graph first!');
    }

    outputParagraph.textContent = 'DFS Traversal: ' + traversalOrder.join(' -> ');
    startDFSBtn.disabled = false;
    generateGraphBtn.disabled = false;
    resetGraphBtn.disabled = false;
}

function resetGraph() {
    nodes = [];
    adjList.clear();
    visited.clear();
    traversalOrder = [];
    outputParagraph.textContent = '';
    clearCanvas();
    startDFSBtn.disabled = true;
}

// Event Listeners
generateGraphBtn.addEventListener('click', generateRandomGraph);
startDFSBtn.addEventListener('click', startDFSVisualization);
resetGraphBtn.addEventListener('click', resetGraph);

// Initial setup
resizeCanvas();
resetGraph(); // Set initial state and disable DFS button
