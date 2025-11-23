// ===== ROAD GENERATION SYSTEM =====

class RoadSystem {
    constructor(scene, biome) {
        this.scene = scene;
        this.biome = biome;
        this.roads = [];
        this.roadSegments = [];
        this.pathPoints = [];
        this.segmentLength = 20;
        this.currentDistance = 0;
    }

    initialize(startPosition) {
        // Generate initial road path
        this.generatePath(startPosition);
        this.createRoadMeshes();
    }

    generatePath(startPosition) {
        this.pathPoints = [];
        const roadConfig = this.biome.roads;

        if (roadConfig.type === 'grid') {
            // City grid roads
            this.generateGridPath(startPosition);
        } else if (roadConfig.type === 'winding' || roadConfig.type === 'mountain') {
            // Curved country/mountain roads
            this.generateWindingPath(startPosition, roadConfig.curviness || 0.3);
        }
    }

    generateGridPath(startPosition) {
        // Simple straight road for city
        for (let i = 0; i < 50; i++) {
            this.pathPoints.push(new THREE.Vector3(
                startPosition.x,
                0,
                startPosition.z + i * this.segmentLength
            ));
        }
    }

    generateWindingPath(startPosition, curviness) {
        let currentPos = startPosition.clone();
        let direction = Math.random() * Math.PI * 2;

        for (let i = 0; i < 50; i++) {
            this.pathPoints.push(currentPos.clone());

            // Add some randomness to direction
            direction += (Math.random() - 0.5) * curviness;

            // Move forward
            currentPos.x += Math.sin(direction) * this.segmentLength;
            currentPos.z += Math.cos(direction) * this.segmentLength;
        }
    }

    createRoadMeshes() {
        const roadWidth = this.biome.roads.width;
        const roadColor = this.biome.colors.road;
        const markingColor = this.biome.colors.roadMarkings;

        // Create road segments
        for (let i = 0; i < this.pathPoints.length - 1; i++) {
            const start = this.pathPoints[i];
            const end = this.pathPoints[i + 1];

            // Calculate direction
            const direction = new THREE.Vector3().subVectors(end, start).normalize();
            const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x);

            // Create road segment geometry
            const geometry = new THREE.BufferGeometry();
            const vertices = new Float32Array([
                start.x - perpendicular.x * roadWidth / 2, start.y + 0.1, start.z - perpendicular.z * roadWidth / 2,
                start.x + perpendicular.x * roadWidth / 2, start.y + 0.1, start.z + perpendicular.z * roadWidth / 2,
                end.x + perpendicular.x * roadWidth / 2, end.y + 0.1, end.z + perpendicular.z * roadWidth / 2,
                end.x - perpendicular.x * roadWidth / 2, end.y + 0.1, end.z - perpendicular.z * roadWidth / 2
            ]);

            const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);

            geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
            geometry.setIndex(new THREE.BufferAttribute(indices, 1));
            geometry.computeVertexNormals();

            const material = new THREE.MeshStandardMaterial({
                color: roadColor,
                roughness: 0.9,
                metalness: 0.1
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.receiveShadow = true;
            this.scene.add(mesh);
            this.roadSegments.push(mesh);

            // Add road markings (center line)
            if (i % 2 === 0) {
                const markingGeometry = new THREE.BoxGeometry(0.3, 0.05, this.segmentLength * 0.4);
                const markingMaterial = new THREE.MeshStandardMaterial({
                    color: markingColor,
                    emissive: markingColor,
                    emissiveIntensity: 0.2
                });
                const marking = new THREE.Mesh(markingGeometry, markingMaterial);
                marking.position.copy(start).lerp(end, 0.5);
                marking.position.y = 0.15;
                marking.rotation.y = Math.atan2(direction.x, direction.z);
                this.scene.add(marking);
                this.roadSegments.push(marking);
            }
        }
    }

    extendRoad(carPosition) {
        // Check if we need to extend the road
        const lastPoint = this.pathPoints[this.pathPoints.length - 1];
        const distanceToEnd = carPosition.distanceTo(lastPoint);

        if (distanceToEnd < 200) {
            // Add more road segments
            const roadConfig = this.biome.roads;
            const numNewSegments = 10;

            for (let i = 0; i < numNewSegments; i++) {
                const prevPoint = this.pathPoints[this.pathPoints.length - 1];
                const prevPrevPoint = this.pathPoints[this.pathPoints.length - 2];

                const direction = new THREE.Vector3().subVectors(prevPoint, prevPrevPoint).normalize();

                // Add slight curve
                const curviness = roadConfig.curviness || 0.1;
                const angle = (Math.random() - 0.5) * curviness;
                direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);

                const newPoint = prevPoint.clone().add(direction.multiplyScalar(this.segmentLength));
                this.pathPoints.push(newPoint);
            }

            // Create meshes for new segments
            this.createRoadMeshes();
        }
    }

    update(carPosition) {
        this.extendRoad(carPosition);
    }

    setBiome(biome) {
        this.biome = biome;
        // Clear existing roads
        this.roadSegments.forEach(segment => {
            this.scene.remove(segment);
            segment.geometry.dispose();
            segment.material.dispose();
        });
        this.roadSegments = [];
        this.pathPoints = [];
    }

    getRoadPath() {
        return this.pathPoints;
    }

    // Helper methods for road-following behavior
    getNearestRoadPoint(position) {
        let nearestPoint = null;
        let minDistance = Infinity;
        let nearestIndex = -1;

        for (let i = 0; i < this.pathPoints.length; i++) {
            const point = this.pathPoints[i];
            const distance = position.distanceTo(point);

            if (distance < minDistance) {
                minDistance = distance;
                nearestPoint = point;
                nearestIndex = i;
            }
        }

        return { point: nearestPoint, distance: minDistance, index: nearestIndex };
    }

    getDistanceFromRoad(position) {
        const nearest = this.getNearestRoadPoint(position);
        return nearest.distance;
    }

    getRoadDirectionAt(position) {
        const nearest = this.getNearestRoadPoint(position);

        if (nearest.index < 0 || nearest.index >= this.pathPoints.length - 1) {
            return new THREE.Vector3(0, 0, 1); // Default forward
        }

        // Get direction from current segment
        const current = this.pathPoints[nearest.index];
        const next = this.pathPoints[nearest.index + 1];

        return new THREE.Vector3().subVectors(next, current).normalize();
    }

    isOnRoad(position) {
        const roadWidth = this.biome.roads.width;
        const distance = this.getDistanceFromRoad(position);
        return distance <= roadWidth / 2;
    }

    getClosestPointOnRoad(position) {
        const nearest = this.getNearestRoadPoint(position);

        if (nearest.index < 0 || nearest.index >= this.pathPoints.length - 1) {
            return nearest.point.clone();
        }

        // Find closest point on the line segment
        const segmentStart = this.pathPoints[nearest.index];
        const segmentEnd = this.pathPoints[nearest.index + 1];

        const segmentVec = new THREE.Vector3().subVectors(segmentEnd, segmentStart);
        const pointVec = new THREE.Vector3().subVectors(position, segmentStart);

        const segmentLength = segmentVec.length();
        const segmentDir = segmentVec.normalize();

        const projection = pointVec.dot(segmentDir);
        const clampedProjection = Math.max(0, Math.min(segmentLength, projection));

        return segmentStart.clone().add(segmentDir.multiplyScalar(clampedProjection));
    }
}
