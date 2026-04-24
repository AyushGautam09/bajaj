const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const user_id = "ayushgautam_19012004";
const email_id = "ag4595@srmist.edu.in";
const college_roll_number = "RA2311052010028";

app.post('/bfhl', (req, res) => {
    const rawData = req.body.data || [];
    
    const invalid_entries = [];
    const duplicate_edges = [];
    const validEdges = [];
    const seenEdges = new Set();
    const childToParent = new Map();
    const adj = new Map();
    const nodes = new Set();

    rawData.forEach(item => {
        if (typeof item !== 'string') return;
        const str = item.trim();
        
        if (!/^[A-Z]->[A-Z]$/.test(str)) {
            invalid_entries.push(str);
            return;
        }

        const [u, v] = str.split('->');
        if (u === v) {
            invalid_entries.push(str);
            return;
        }

        if (seenEdges.has(str)) {
            duplicate_edges.push(str);
            return;
        }
        seenEdges.add(str);

        if (childToParent.has(v)) {
            return; 
        }

        childToParent.set(v, u);
        validEdges.push([u, v]);
        nodes.add(u);
        nodes.add(v);

        if (!adj.has(u)) adj.set(u, []);
        adj.get(u).push(v);
        if (!adj.has(v)) adj.set(v, []);
    });

    const components = [];
    const visitedNodes = new Set();

    nodes.forEach(node => {
        if (!visitedNodes.has(node)) {
            const comp = [];
            const q = [node];
            visitedNodes.add(node);
            
            while (q.length > 0) {
                const curr = q.shift();
                comp.push(curr);
                
                nodes.forEach(n => {
                    if ((childToParent.get(n) === curr || childToParent.get(curr) === n) && !visitedNodes.has(n)) {
                        visitedNodes.add(n);
                        q.push(n);
                    }
                });
            }
            components.push(comp);
        }
    });

    const hierarchies = [];
    let total_trees = 0;
    let total_cycles = 0;
    let largest_tree_root = "";
    let max_depth = 0;

    components.forEach(comp => {
        let roots = comp.filter(n => !childToParent.has(n));
        
        let root = "";
        if (roots.length === 0) {
            comp.sort();
            root = comp[0];
        } else {
            root = roots[0];
        }

        let has_cycle = false;
        const visitedInPath = new Set();
        
        function detectCycle(curr) {
            if (visitedInPath.has(curr)) return true;
            visitedInPath.add(curr);
            const children = adj.get(curr) || [];
            for (const child of children) {
                if (comp.includes(child)) {
                    if (detectCycle(child)) return true;
                }
            }
            visitedInPath.delete(curr);
            return false;
        }

        if (roots.length === 0 || detectCycle(root)) {
            has_cycle = true;
        }

        if (has_cycle) {
            hierarchies.push({
                root: root,
                tree: {},
                has_cycle: true
            });
            total_cycles++;
        } else {
            function buildTree(curr) {
                const nodeObj = {};
                const children = adj.get(curr) || [];
                for (const child of children) {
                    nodeObj[child] = buildTree(child);
                }
                return nodeObj;
            }

            function getDepth(curr) {
                const children = adj.get(curr) || [];
                if (children.length === 0) return 1;
                let maxChildDepth = 0;
                for (const child of children) {
                    maxChildDepth = Math.max(maxChildDepth, getDepth(child));
                }
                return maxChildDepth + 1;
            }

            const tree = buildTree(root);
            const depth = getDepth(root);
            
            hierarchies.push({
                root: root,
                tree: { [root]: tree },
                depth: depth
            });
            
            total_trees++;
            if (depth > max_depth) {
                max_depth = depth;
                largest_tree_root = root;
            } else if (depth === max_depth) {
                if (root < largest_tree_root || largest_tree_root === "") {
                    largest_tree_root = root;
                }
            }
        }
    });

    res.json({
        user_id: user_id,
        email_id: email_id,
        college_roll_number: college_roll_number,
        hierarchies,
        invalid_entries,
        duplicate_edges,
        summary: {
            total_trees,
            total_cycles,
            largest_tree_root
        }
    });
});

app.use(express.static('src'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});