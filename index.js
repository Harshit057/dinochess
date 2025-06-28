// 3D Dinosaur Chess Game
class DinoChess {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.board = [];
        this.pieces = [];
        this.selectedPiece = null;
        this.currentPlayer = 'white';
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.init();
    }

    init() {
        this.createScene();
        this.createLighting();
        this.createBoard();
        this.createPieces();
        this.setupControls();
        this.setupEventListeners();
        this.animate();
    }

    createScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x2a2a3a);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(10, 15, 10);
        this.camera.lookAt(0, 0, 0);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: document.getElementById('chess-canvas'),
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
    }

    createLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // Main directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(20, 30, 20);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 100;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        this.scene.add(directionalLight);
        
        // Secondary light for better illumination
        const secondaryLight = new THREE.DirectionalLight(0x8888ff, 0.3);
        secondaryLight.position.set(-20, 20, -20);
        this.scene.add(secondaryLight);
    }

    createBoard() {
        const boardGroup = new THREE.Group();
        
        // Board base
        const boardGeometry = new THREE.BoxGeometry(16.5, 0.5, 16.5);
        const boardMaterial = new THREE.MeshLambertMaterial({ color: 0x3a3a3a });
        const boardBase = new THREE.Mesh(boardGeometry, boardMaterial);
        boardBase.position.y = -0.25;
        boardBase.receiveShadow = true;
        boardGroup.add(boardBase);
        
        // Chess squares
        for (let row = 0; row < 8; row++) {
            this.board[row] = [];
            for (let col = 0; col < 8; col++) {
                const isLight = (row + col) % 2 === 0;
                const squareGeometry = new THREE.BoxGeometry(2, 0.1, 2);
                const squareMaterial = new THREE.MeshLambertMaterial({
                    color: isLight ? 0xf0d9b5 : 0xb58863
                });
                
                const square = new THREE.Mesh(squareGeometry, squareMaterial);
                square.position.set(
                    (col - 3.5) * 2,
                    0.05,
                    (row - 3.5) * 2
                );
                square.receiveShadow = true;
                square.userData = { row, col, type: 'square' };
                
                boardGroup.add(square);
                this.board[row][col] = square;
            }
        }
        
        this.scene.add(boardGroup);
    }

    createPieces() {
        // Define piece positions
        const initialSetup = [
            ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'],
            ['pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn'],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            ['pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn'],
            ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']
        ];

        for (let row = 0; row < 8; row++) {
            this.pieces[row] = [];
            for (let col = 0; col < 8; col++) {
                if (initialSetup[row][col]) {
                    const color = row < 2 ? 'black' : 'white';
                    const piece = this.createPiece(initialSetup[row][col], color, row, col);
                    this.pieces[row][col] = piece;
                    this.scene.add(piece);
                } else {
                    this.pieces[row][col] = null;
                }
            }
        }
    }

    createPiece(type, color, row, col) {
        const group = new THREE.Group();
        
        // Base material
        const material = new THREE.MeshPhongMaterial({
            color: color === 'white' ? 0xf5f5f5 : 0x2c2c2c,
            shininess: 30
        });

        let geometry;
        
        switch (type) {
            case 'pawn':
                // Dinosaur egg shape for pawn
                geometry = new THREE.SphereGeometry(0.3, 8, 6);
                geometry.scale(1, 1.2, 1);
                break;
                
            case 'rook':
                // T-Rex shape (simplified)
                const bodyGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.4);
                const headGeometry = new THREE.BoxGeometry(0.8, 0.6, 0.6);
                const body = new THREE.Mesh(bodyGeometry, material);
                const head = new THREE.Mesh(headGeometry, material);
                head.position.set(0, 0.7, 0.3);
                group.add(body);
                group.add(head);
                break;
                
            case 'knight':
                // Triceratops-like shape
                const knightBody = new THREE.CylinderGeometry(0.3, 0.4, 0.8, 8);
                const knightHead = new THREE.ConeGeometry(0.4, 0.6, 6);
                const bodyMesh = new THREE.Mesh(knightBody, material);
                const headMesh = new THREE.Mesh(knightHead, material);
                headMesh.position.set(0, 0.7, 0);
                headMesh.rotation.x = Math.PI / 6;
                group.add(bodyMesh);
                group.add(headMesh);
                break;
                
            case 'bishop':
                // Stegosaurus-like shape
                const bishopBody = new THREE.CylinderGeometry(0.25, 0.35, 1, 8);
                const spike1 = new THREE.ConeGeometry(0.1, 0.4, 4);
                const spike2 = new THREE.ConeGeometry(0.1, 0.3, 4);
                const bodyMesh2 = new THREE.Mesh(bishopBody, material);
                const spike1Mesh = new THREE.Mesh(spike1, material);
                const spike2Mesh = new THREE.Mesh(spike2, material);
                spike1Mesh.position.set(0, 0.7, 0);
                spike2Mesh.position.set(0, 0.4, -0.2);
                group.add(bodyMesh2);
                group.add(spike1Mesh);
                group.add(spike2Mesh);
                break;
                
            case 'queen':
                // Brontosaurus-like shape
                const queenBody = new THREE.CylinderGeometry(0.4, 0.5, 0.8, 8);
                const queenNeck = new THREE.CylinderGeometry(0.15, 0.2, 1, 8);
                const queenHead = new THREE.SphereGeometry(0.25, 8, 6);
                const queenBodyMesh = new THREE.Mesh(queenBody, material);
                const queenNeckMesh = new THREE.Mesh(queenNeck, material);
                const queenHeadMesh = new THREE.Mesh(queenHead, material);
                queenNeckMesh.position.set(0, 0.9, 0);
                queenHeadMesh.position.set(0, 1.5, 0);
                group.add(queenBodyMesh);
                group.add(queenNeckMesh);
                group.add(queenHeadMesh);
                break;
                
            case 'king':
                // Royal T-Rex with crown
                const kingBody = new THREE.CylinderGeometry(0.35, 0.45, 1, 8);
                const kingHead = new THREE.SphereGeometry(0.35, 8, 6);
                const crown = new THREE.CylinderGeometry(0.4, 0.35, 0.2, 8);
                const kingBodyMesh = new THREE.Mesh(kingBody, material);
                const kingHeadMesh = new THREE.Mesh(kingHead, material);
                const crownMesh = new THREE.Mesh(crown, new THREE.MeshPhongMaterial({ color: 0xffd700 }));
                kingHeadMesh.position.set(0, 0.8, 0);
                crownMesh.position.set(0, 1.2, 0);
                group.add(kingBodyMesh);
                group.add(kingHeadMesh);
                group.add(crownMesh);
                break;
                
            default:
                geometry = new THREE.BoxGeometry(0.5, 0.8, 0.5);
                const defaultMesh = new THREE.Mesh(geometry, material);
                group.add(defaultMesh);
        }

        // Position the piece
        group.position.set(
            (col - 3.5) * 2,
            0.5,
            (row - 3.5) * 2
        );
        
        // Add metadata
        group.userData = {
            type: type,
            color: color,
            row: row,
            col: col,
            originalPosition: group.position.clone()
        };
        
        // Enable shadows
        group.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        return group;
    }

    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2.2;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 30;
        this.controls.target.set(0, 0, 0);
    }

    setupEventListeners() {
        // Mouse events
        this.renderer.domElement.addEventListener('click', (event) => this.onMouseClick(event));
        this.renderer.domElement.addEventListener('mousemove', (event) => this.onMouseMove(event));
        
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Reset camera button
        document.getElementById('reset-camera').addEventListener('click', () => this.resetCamera());
    }

    onMouseClick(event) {
        this.updateMousePosition(event);
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);
        
        if (intersects.length > 0) {
            const intersected = intersects[0].object;
            let piece = intersected.parent;
            
            // Find the piece group
            while (piece && !piece.userData.type) {
                piece = piece.parent;
            }
            
            if (piece && piece.userData.type !== 'square') {
                this.selectPiece(piece);
            }
        }
    }

    onMouseMove(event) {
        this.updateMousePosition(event);
    }

    updateMousePosition(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    selectPiece(piece) {
        if (this.selectedPiece) {
            this.deselectPiece();
        }
        
        if (piece.userData.color === this.currentPlayer) {
            this.selectedPiece = piece;
            piece.position.y += 0.5; // Lift the piece
            this.highlightPiece(piece);
        }
    }

    deselectPiece() {
        if (this.selectedPiece) {
            this.selectedPiece.position.y = 0.5;
            this.removeHighlight(this.selectedPiece);
            this.selectedPiece = null;
        }
    }

    highlightPiece(piece) {
        // Add a subtle glow effect
        piece.traverse((child) => {
            if (child.isMesh) {
                child.material.emissive.setHex(0x444444);
            }
        });
    }

    removeHighlight(piece) {
        piece.traverse((child) => {
            if (child.isMesh) {
                child.material.emissive.setHex(0x000000);
            }
        });
    }

    resetCamera() {
        this.camera.position.set(10, 15, 10);
        this.camera.lookAt(0, 0, 0);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', () => {
    const game = new DinoChess();
});
