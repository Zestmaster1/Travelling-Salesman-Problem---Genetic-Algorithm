# Travelling Salesman Problem - Genetic Algorithm

A genetic algorithm evolves ordered routes visiting every point once, optimizing for shortest total distance.
Each route is a permutation, starting at index 0.

Algorithm Details
- Generates random points (locations) on the map
- Generates a randomized population of routes visiting every point once
- Evolves towards a shorter and shorter route continuously
- Best route is shown as a black line, others shown as faint grey lines
- Points can be dragged around and the algorithm keeps evolving in real time

Evolution
- Tournament selection
- One-cut permutation crossover
- Random index swap mutation + 2opt mutation, random chance of either
- Elitism, best route always copied each generation
