# Homework 1

> Kaynak: SE 422 – Homework 1 (Moodle, PDF). Hocanın notu: "This homework will be embedded in the Midterm exam … The aim is to assess the insights you should develop while working on the homework."

<!-- Task: 1 -->
## Task 1: Recursive Binary Counter

Write a recursive function named `count_in_binary` that accepts one parameter: a positive integer `n`. The function prints the binary representation of every integer from 0 up to `n` (inclusive).

**Sample Run:**

```python
count_in_binary(3)
```

Expected output as clean binary strings:

```
0
1
10
11
```

### Analysis of Task 1
Investigate the behavior of recursive functions in Python by comparing this implementation to iterative and non-recursive alternatives in detailed, informative Markdown cells.

- Compare the memory model of recursion against an iterative counterpart (call stack frame allocation vs. constant frame overhead).
- Discuss Python's recursion limit and the risk of a `RecursionError` on large values of `n`.
- Present an alternative approach using a generator expression or standard iterative loop, evaluating readability, execution speed, and space complexity.

<!-- Task: 2 -->
## Task 2: Operator Overloading with a Vector Class

To implement operator overloading, Python relies on special dunder methods. Define a `Vector` class representing a 2D vector that implements vector addition and string formatting using the special methods `__add__` and `__str__`.

**Sample Run:**

```python
v1 = Vector(1, 2)
v2 = Vector(3, 4)
v3 = v1 + v2   # __add__
print(v3)      # __str__
```

Output:

```
(4, 6)
```

- The constructor `__init__(self, x, y)` should store Cartesian coordinates.
- Implement `__add__(self, other)` to return a new `Vector` instance representing the component-wise sum.
- Implement `__str__(self)` to return coordinates formatted cleanly as `(x, y)`.

### Analysis of Task 2
Investigate the mechanics of special methods such as `__add__`, `__radd__`, and `__str__` in detail. Provide alternate implementations or edge cases (e.g., mismatched dimensions, scalar addition handling) using clear Markdown cells.

<!-- Task: 3 -->
## Task 3: CPython Small Integer Caching

CPython pre-allocates an array of small integer objects in memory at startup to optimize performance and reduce memory fragmentation. When variables point to integers within this range, they bind to the same shared memory object (`PyLongObject`) rather than instantiating a new one.

- Write an algorithm that scans the range [-1000, 1000] and determines the exact bounds where integer identity holds true.
- **Important:** To prevent the Python compiler's constant-folding optimization from skewing results within the same code block, generate tested integers dynamically at runtime rather than using static literal assignments.
- Display the detected range alongside the active Python version using the `sys` module.

**Sample Run:**

```
Python version: 3.11.3
Caching starts at: -5
Caching stops at: 256
```

### Analysis of Task 3
- What is CPython?
- What is `PyLongObject`?
- Analyze how compiler optimizations, code blocks (interactive REPL vs. script/module compilation), and Python versions impact object identity.
- Explain the difference between value equality (`==`) and reference identity (`is`), detailing why `is` should not be used for numerical comparison in general code.
- Can NumPy be used for this task? Is NumPy a sound choice for detecting CPython's internal integer caching mechanisms? Explain your reasoning.

<!-- Task: 4 -->
## Task 4: Truncation vs. Rounding

Monetary systems require deliberate rounding strategies to avoid systemic statistical drift. This task analyzes numerical truncation versus rounding.

- Write a function to generate a reproducible set of 1,000 random floating-point values with decimals.
- Process the dataset through both `int()` and `round()`, and compare the resulting values against the originals.

### Analysis of Task 4
- Analyze the difference between truncation via `int()` and rounding via `round()`.
- Explain Python's round-half-to-even rule ("banker's rounding") when the fractional part is exactly 0.5, including its effect on statistical bias.
- Benchmark and compare the execution performance of `int()` vs. `round()` across a large dataset (e.g., 10^6 values).
- Can NumPy be used here (e.g., `np.trunc()`, `np.round()`, `np.rint()`) across an array of 10^6 elements? Discuss whether vectorization makes NumPy a superior choice for large arrays.

<!-- Task: 5 -->
## Task 5: NumPy Exercises

Complete the following exercises using NumPy:

1. **Broadcasting Addition:**
   - Create a 3 × 4 NumPy array filled with integers from 1 to 12.
   - Create a 1D NumPy array with 4 elements (e.g., `np.array([10, 20, 30, 40])`).
   - Using broadcasting, add this 1D array to each row of the 3 × 4 array.

2. **Two-Way Broadcasting:**
   - Create a 1D NumPy array with 3 elements and reshape it to a column vector of shape (3, 1).
   - Add this (3, 1) column vector to the 3 × 4 array.
   - State the resulting shape and explain how NumPy's broadcasting rules govern the dimensions.

3. **Array Aggregations:**
   - Generate a 2D NumPy array of random integers between 0 and 100 of shape (5, 4).
   - Compute the global minimum of the entire array.
   - Find the maximum value along each column.
   - Compute the mean of each row.

4. **Data Standardization (Z-score Normalization):**
   - Using the 2D random array from the previous step, standardize the data column by column:

     X̂ = (X − μ_col) / σ_col

   - Implement this using vectorized arithmetic, passing the `axis=0` parameter to aggregation methods. Ensure dimensions align correctly across columns.

### Analysis of Task 5
In dedicated Markdown cells, discuss:

- How NumPy determines broadcast compatibility between shapes (3, 4) and (4,), versus (3, 4) and (3, 1).
- Why column-wise operations across 2D arrays broadcast seamlessly with a 1D summary array of shape (4,), and when the use of `keepdims=True` becomes necessary in higher-dimensional data pipelines.
- The computational benefits of vectorized operations over nested Python loops for machine learning preprocessing pipelines.
