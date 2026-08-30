import { DSANode, DSAEdge } from './types';

// Helper to clean double-wrapped markdown URLs: "[url](url)" -> "url"
export function cleanUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  const match = rawUrl.match(/\[(.*?)\]\((.*?)\)/);
  if (match && match[2]) {
    return match[2].trim();
  }
  if (match && match[1]) {
    return match[1].trim();
  }
  return rawUrl.trim();
}

// Generate a deterministic UUID v4 string from slug for seed consistency
export function generateDeterministicUuid(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash << 5) - hash + slug.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const part2 = slug.length.toString(16).padStart(4, '0');
  return `${hex.slice(0, 8)}-${part2}-4000-8000-${hex.padEnd(12, '0').slice(0, 12)}`;
}

const rawSeedNodes = [
  // --- MODULE 1: ARRAYS & PREFIX SUMS ---
  { slug: "running-sum", label: "Running Sum of 1d Array", category: "Arrays", difficulty: "Easy", url: "[https://leetcode.com/problems/running-sum-of-1d-array/](https://leetcode.com/problems/running-sum-of-1d-array/)" },
  { slug: "even-digits", label: "Numbers with Even Digits", category: "Arrays", difficulty: "Easy", url: "[https://leetcode.com/problems/find-numbers-with-even-number-of-digits/](https://leetcode.com/problems/find-numbers-with-even-number-of-digits/)" },
  { slug: "max-words", label: "Max Words in Sentences", category: "Arrays", difficulty: "Easy", url: "[https://leetcode.com/problems/maximum-number-of-words-found-in-sentences/](https://leetcode.com/problems/maximum-number-of-words-found-in-sentences/)" },
  { slug: "stock-1", label: "Best Time to Buy and Sell Stock", category: "Arrays", difficulty: "Easy", url: "[https://leetcode.com/problems/best-time-to-buy-and-sell-stock/](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/)" },
  { slug: "two-sum", label: "Two Sum", category: "Arrays", difficulty: "Easy", url: "[https://leetcode.com/problems/two-sum/](https://leetcode.com/problems/two-sum/)" },
  { slug: "max-subarray", label: "Maximum Subarray (Kadane)", category: "Arrays", difficulty: "Medium", url: "[https://leetcode.com/problems/maximum-subarray/](https://leetcode.com/problems/maximum-subarray/)" },
  { slug: "product-except-self", label: "Product of Array Except Self", category: "Arrays", difficulty: "Medium", url: "[https://leetcode.com/problems/product-of-array-except-self/](https://leetcode.com/problems/product-of-array-except-self/)" },
  { slug: "subarray-sum-k", label: "Subarray Sum Equals K", category: "Arrays", difficulty: "Medium", url: "[https://leetcode.com/problems/subarray-sum-equals-k/](https://leetcode.com/problems/subarray-sum-equals-k/)" },
  { slug: "contiguous-array", label: "Contiguous Array", category: "Arrays", difficulty: "Medium", url: "[https://leetcode.com/problems/contiguous-array/](https://leetcode.com/problems/contiguous-array/)" },
  { slug: "subarray-div-k", label: "Subarray Sums Divisible by K", category: "Arrays", difficulty: "Medium", url: "[https://leetcode.com/problems/subarray-sums-divisible-by-k/](https://leetcode.com/problems/subarray-sums-divisible-by-k/)" },

  // --- MODULE 2: HASH MAPS & SETS ---
  { slug: "contains-duplicate", label: "Contains Duplicate", category: "Hash Maps & Sets", difficulty: "Easy", url: "[https://leetcode.com/problems/contains-duplicate/](https://leetcode.com/problems/contains-duplicate/)" },
  { slug: "majority-element", label: "Majority Element", category: "Hash Maps & Sets", difficulty: "Easy", url: "[https://leetcode.com/problems/majority-element/](https://leetcode.com/problems/majority-element/)" },
  { slug: "valid-anagram", label: "Valid Anagram", category: "Hash Maps & Sets", difficulty: "Easy", url: "[https://leetcode.com/problems/valid-anagram/](https://leetcode.com/problems/valid-anagram/)" },
  { slug: "longest-consec-seq", label: "Longest Consecutive Sequence", category: "Hash Maps & Sets", difficulty: "Medium", url: "[https://leetcode.com/problems/longest-consecutive-sequence/](https://leetcode.com/problems/longest-consecutive-sequence/)" },

  // --- MODULE 3: TWO POINTERS & SLIDING WINDOW ---
  { slug: "valid-palindrome", label: "Valid Palindrome", category: "Sliding Window", difficulty: "Easy", url: "[https://leetcode.com/problems/valid-palindrome/](https://leetcode.com/problems/valid-palindrome/)" },
  { slug: "container-water", label: "Container With Most Water", category: "Sliding Window", difficulty: "Medium", url: "[https://leetcode.com/problems/container-with-most-water/](https://leetcode.com/problems/container-with-most-water/)" },
  { slug: "3sum", label: "3Sum", category: "Sliding Window", difficulty: "Medium", url: "[https://leetcode.com/problems/3sum/](https://leetcode.com/problems/3sum/)" },
  { slug: "longest-substr-no-repeat", label: "Longest Substring Without Repeating Chars", category: "Sliding Window", difficulty: "Medium", url: "[https://leetcode.com/problems/longest-substring-without-repeating-characters/](https://leetcode.com/problems/longest-substring-without-repeating-characters/)" },
  { slug: "find-all-anagrams", label: "Find All Anagrams in a String", category: "Sliding Window", difficulty: "Medium", url: "[https://leetcode.com/problems/find-all-anagrams-in-a-string/](https://leetcode.com/problems/find-all-anagrams-in-a-string/)" },
  { slug: "longest-palindromic-substr", label: "Longest Palindromic Substring", category: "Sliding Window", difficulty: "Medium", url: "[https://leetcode.com/problems/longest-palindromic-substring/](https://leetcode.com/problems/longest-palindromic-substring/)" },
  { slug: "min-window-substr", label: "Minimum Window Substring", category: "Sliding Window", difficulty: "Hard", url: "[https://leetcode.com/problems/minimum-window-substring/](https://leetcode.com/problems/minimum-window-substring/)" },
  { slug: "max-avg-subarray", label: "Maximum Average Subarray I", category: "Sliding Window", difficulty: "Easy", url: "[https://leetcode.com/problems/maximum-average-subarray-i/](https://leetcode.com/problems/maximum-average-subarray-i/)" },
  { slug: "contains-duplicate-ii", label: "Contains Duplicate II", category: "Sliding Window", difficulty: "Easy", url: "[https://leetcode.com/problems/contains-duplicate-ii/](https://leetcode.com/problems/contains-duplicate-ii/)" },
  { slug: "subarray-avg-threshold", label: "Sub-arrays Size K Avg >= Threshold", category: "Sliding Window", difficulty: "Medium", url: "[https://leetcode.com/problems/number-of-sub-arrays-of-size-k-and-average-greater-than-or-equal-to-threshold/](https://leetcode.com/problems/number-of-sub-arrays-of-size-k-and-average-greater-than-or-equal-to-threshold/)" },
  { slug: "longest-repeat-char-replace", label: "Longest Repeating Character Replacement", category: "Sliding Window", difficulty: "Medium", url: "[https://leetcode.com/problems/longest-repeating-character-replacement/](https://leetcode.com/problems/longest-repeating-character-replacement/)" },
  { slug: "permutation-in-string", label: "Permutation in String", category: "Sliding Window", difficulty: "Medium", url: "[https://leetcode.com/problems/permutation-in-string/](https://leetcode.com/problems/permutation-in-string/)" },
  { slug: "longest-subarray-del-one", label: "Longest Subarray 1s Deleting One", category: "Sliding Window", difficulty: "Medium", url: "[https://leetcode.com/problems/longest-subarray-of-1s-after-deleting-one-element/](https://leetcode.com/problems/longest-subarray-of-1s-after-deleting-one-element/)" },
  { slug: "max-consecutive-ones-iii", label: "Max Consecutive Ones III", category: "Sliding Window", difficulty: "Medium", url: "[https://leetcode.com/problems/max-consecutive-ones-iii/](https://leetcode.com/problems/max-consecutive-ones-iii/)" },
  { slug: "freq-most-frequent", label: "Frequency of Most Frequent Element", category: "Sliding Window", difficulty: "Medium", url: "[https://leetcode.com/problems/frequency-of-the-most-frequent-element/](https://leetcode.com/problems/frequency-of-the-most-frequent-element/)" },

  // --- MODULE 4: BINARY SEARCH ---
  { slug: "binary-search", label: "Binary Search", category: "Binary Search", difficulty: "Easy", url: "[https://leetcode.com/problems/binary-search/](https://leetcode.com/problems/binary-search/)" },
  { slug: "search-insert-pos", label: "Search Insert Position", category: "Binary Search", difficulty: "Easy", url: "[https://leetcode.com/problems/search-insert-position/](https://leetcode.com/problems/search-insert-position/)" },
  { slug: "find-first-last-pos", label: "First & Last Position in Sorted Array", category: "Binary Search", difficulty: "Medium", url: "[https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/](https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/)" },
  { slug: "first-bad-version", label: "First Bad Version", category: "Binary Search", difficulty: "Easy", url: "[https://leetcode.com/problems/first-bad-version/](https://leetcode.com/problems/first-bad-version/)" },
  { slug: "sqrt-x", label: "Sqrt(x)", category: "Binary Search", difficulty: "Easy", url: "[https://leetcode.com/problems/sqrtx/](https://leetcode.com/problems/sqrtx/)" },
  { slug: "guess-number", label: "Guess Number Higher or Lower", category: "Binary Search", difficulty: "Easy", url: "[https://leetcode.com/problems/guess-number-higher-or-lower/](https://leetcode.com/problems/guess-number-higher-or-lower/)" },
  { slug: "search-rotated-array", label: "Search in Rotated Sorted Array", category: "Binary Search", difficulty: "Medium", url: "[https://leetcode.com/problems/search-in-rotated-sorted-array/](https://leetcode.com/problems/search-in-rotated-sorted-array/)" },
  { slug: "find-peak-element", label: "Find Peak Element", category: "Binary Search", difficulty: "Medium", url: "[https://leetcode.com/problems/find-peak-element/](https://leetcode.com/problems/find-peak-element/)" },
  { slug: "koko-bananas", label: "Koko Eating Bananas", category: "Binary Search", difficulty: "Medium", url: "[https://leetcode.com/problems/koko-eating-bananas/](https://leetcode.com/problems/koko-eating-bananas/)" },
  { slug: "search-2d-matrix", label: "Search a 2D Matrix", category: "Binary Search", difficulty: "Medium", url: "[https://leetcode.com/problems/search-a-2d-matrix/](https://leetcode.com/problems/search-a-2d-matrix/)" },
  { slug: "find-min-rotated", label: "Find Minimum in Rotated Sorted Array", category: "Binary Search", difficulty: "Medium", url: "[https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/)" },
  { slug: "single-elem-sorted", label: "Single Element in a Sorted Array", category: "Binary Search", difficulty: "Medium", url: "[https://leetcode.com/problems/single-element-in-a-sorted-array/](https://leetcode.com/problems/single-element-in-a-sorted-array/)" },
  { slug: "search-2d-matrix-ii", label: "Search a 2D Matrix II", category: "Binary Search", difficulty: "Medium", url: "[https://leetcode.com/problems/search-a-2d-matrix-ii/](https://leetcode.com/problems/search-a-2d-matrix-ii/)" },
  { slug: "ship-packages-d-days", label: "Capacity To Ship Packages in D Days", category: "Binary Search", difficulty: "Medium", url: "[https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/](https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/)" },
  { slug: "aggressive-cows", label: "Aggressive Cows", category: "Binary Search", difficulty: "Medium", url: "[https://www.geeksforgeeks.org/problems/aggressive-cows/1](https://www.geeksforgeeks.org/problems/aggressive-cows/1)" },
  { slug: "painters-partition", label: "Painter's Partition Problem", category: "Binary Search", difficulty: "Medium", url: "[https://www.interviewbit.com/problems/painters-partition-problem/](https://www.interviewbit.com/problems/painters-partition-problem/)" },
  { slug: "median-two-sorted", label: "Median of Two Sorted Arrays", category: "Binary Search", difficulty: "Hard", url: "[https://leetcode.com/problems/median-of-two-sorted-arrays/](https://leetcode.com/problems/median-of-two-sorted-arrays/)" },
  { slug: "max-removable-chars", label: "Max Number of Removable Characters", category: "Binary Search", difficulty: "Medium", url: "[https://leetcode.com/problems/maximum-number-of-removable-characters/](https://leetcode.com/problems/maximum-number-of-removable-characters/)" },

  // --- MODULE 5: INTERVALS ---
  { slug: "merge-intervals", label: "Merge Intervals", category: "Intervals", difficulty: "Medium", url: "[https://leetcode.com/problems/merge-intervals/](https://leetcode.com/problems/merge-intervals/)" },
  { slug: "insert-interval", label: "Insert Interval", category: "Intervals", difficulty: "Medium", url: "[https://leetcode.com/problems/insert-interval/](https://leetcode.com/problems/insert-interval/)" },
  { slug: "non-overlapping-intervals", label: "Non-overlapping Intervals", category: "Intervals", difficulty: "Medium", url: "[https://leetcode.com/problems/non-overlapping-intervals/](https://leetcode.com/problems/non-overlapping-intervals/)" },

  // --- MODULE 6: STACKS & DEQUES ---
  { slug: "valid-parentheses", label: "Valid Parentheses", category: "Stacks", difficulty: "Easy", url: "[https://leetcode.com/problems/valid-parentheses/](https://leetcode.com/problems/valid-parentheses/)" },
  { slug: "asteroid-collision", label: "Asteroid Collision", category: "Stacks", difficulty: "Medium", url: "[https://leetcode.com/problems/asteroid-collision/](https://leetcode.com/problems/asteroid-collision/)" },
  { slug: "next-greater-i", label: "Next Greater Element I", category: "Stacks", difficulty: "Easy", url: "[https://leetcode.com/problems/next-greater-element-i/](https://leetcode.com/problems/next-greater-element-i/)" },
  { slug: "decode-string", label: "Decode String", category: "Stacks", difficulty: "Medium", url: "[https://leetcode.com/problems/decode-string/](https://leetcode.com/problems/decode-string/)" },
  { slug: "daily-temperatures", label: "Daily Temperatures", category: "Stacks", difficulty: "Medium", url: "[https://leetcode.com/problems/daily-temperatures/](https://leetcode.com/problems/daily-temperatures/)" },
  { slug: "remove-k-digits", label: "Remove K Digits", category: "Stacks", difficulty: "Medium", url: "[https://leetcode.com/problems/remove-k-digits/](https://leetcode.com/problems/remove-k-digits/)" },
  { slug: "largest-histogram", label: "Largest Rectangle in Histogram", category: "Stacks", difficulty: "Hard", url: "[https://leetcode.com/problems/largest-rectangle-in-histogram/](https://leetcode.com/problems/largest-rectangle-in-histogram/)" },
  { slug: "queue-using-stacks", label: "Implement Queue using Stacks", category: "Stacks", difficulty: "Easy", url: "[https://leetcode.com/problems/implement-queue-using-stacks/](https://leetcode.com/problems/implement-queue-using-stacks/)" },
  { slug: "min-stack", label: "Min Stack", category: "Stacks", difficulty: "Medium", url: "[https://leetcode.com/problems/min-stack/](https://leetcode.com/problems/min-stack/)" },
  { slug: "eval-rpn", label: "Evaluate Reverse Polish Notation", category: "Stacks", difficulty: "Medium", url: "[https://leetcode.com/problems/evaluate-reverse-polish-notation/](https://leetcode.com/problems/evaluate-reverse-polish-notation/)" },
  { slug: "next-greater-ii", label: "Next Greater Element II", category: "Stacks", difficulty: "Medium", url: "[https://leetcode.com/problems/next-greater-element-ii/](https://leetcode.com/problems/next-greater-element-ii/)" },
  { slug: "sliding-window-max", label: "Sliding Window Maximum", category: "Stacks", difficulty: "Hard", url: "[https://leetcode.com/problems/sliding-window-maximum/](https://leetcode.com/problems/sliding-window-maximum/)" },
  { slug: "first-neg-window-k", label: "First Negative Int in Window K", category: "Stacks", difficulty: "Medium", url: "[https://www.geeksforgeeks.org/problems/first-negative-integer-in-every-window-of-size-k3345/1](https://www.geeksforgeeks.org/problems/first-negative-integer-in-every-window-of-size-k3345/1)" },
  { slug: "shortest-subarray-sum-k", label: "Shortest Subarray Sum >= K", category: "Stacks", difficulty: "Hard", url: "[https://leetcode.com/problems/shortest-subarray-with-sum-at-least-k/](https://leetcode.com/problems/shortest-subarray-with-sum-at-least-k/)" },

  // --- MODULE 7: LINKED LISTS ---
  { slug: "reverse-linked-list", label: "Reverse Linked List", category: "Linked Lists", difficulty: "Easy", url: "[https://leetcode.com/problems/reverse-linked-list/](https://leetcode.com/problems/reverse-linked-list/)" },
  { slug: "middle-linked-list", label: "Middle of the Linked List", category: "Linked Lists", difficulty: "Easy", url: "[https://leetcode.com/problems/middle-of-the-linked-list/](https://leetcode.com/problems/middle-of-the-linked-list/)" },
  { slug: "linked-list-cycle", label: "Linked List Cycle", category: "Linked Lists", difficulty: "Easy", url: "[https://leetcode.com/problems/linked-list-cycle/](https://leetcode.com/problems/linked-list-cycle/)" },
  { slug: "merge-two-lists", label: "Merge Two Sorted Lists", category: "Linked Lists", difficulty: "Easy", url: "[https://leetcode.com/problems/merge-two-sorted-lists/](https://leetcode.com/problems/merge-two-sorted-lists/)" },
  { slug: "remove-nth-end", label: "Remove Nth Node From End", category: "Linked Lists", difficulty: "Medium", url: "[https://leetcode.com/problems/remove-nth-node-from-end-of-list/](https://leetcode.com/problems/remove-nth-node-from-end-of-list/)" },
  { slug: "intersection-two-lists", label: "Intersection of Two Linked Lists", category: "Linked Lists", difficulty: "Easy", url: "[https://leetcode.com/problems/intersection-of-two-lists/](https://leetcode.com/problems/intersection-of-two-lists/)" },
  { slug: "palindrome-linked-list", label: "Palindrome Linked List", category: "Linked Lists", difficulty: "Easy", url: "[https://leetcode.com/problems/palindrome-linked-list/](https://leetcode.com/problems/palindrome-linked-list/)" },
  { slug: "copy-random-list", label: "Copy List with Random Pointer", category: "Linked Lists", difficulty: "Medium", url: "[https://leetcode.com/problems/copy-list-with-random-pointer/](https://leetcode.com/problems/copy-list-with-random-pointer/)" },
  { slug: "flatten-multilevel-dll", label: "Flatten Multilevel Doubly List", category: "Linked Lists", difficulty: "Medium", url: "[https://leetcode.com/problems/flatten-a-multilevel-doubly-linked-list/](https://leetcode.com/problems/flatten-a-multilevel-doubly-linked-list/)" },
  { slug: "lru-cache", label: "LRU Cache", category: "Linked Lists", difficulty: "Medium", url: "[https://leetcode.com/problems/lru-cache/](https://leetcode.com/problems/lru-cache/)" },
  { slug: "add-two-numbers", label: "Add Two Numbers", category: "Linked Lists", difficulty: "Medium", url: "[https://leetcode.com/problems/add-two-numbers/](https://leetcode.com/problems/add-two-numbers/)" },
  { slug: "linked-list-cycle-ii", label: "Linked List Cycle II", category: "Linked Lists", difficulty: "Medium", url: "[https://leetcode.com/problems/linked-list-cycle-ii/](https://leetcode.com/problems/linked-list-cycle-ii/)" },
  { slug: "reorder-list", label: "Reorder List", category: "Linked Lists", difficulty: "Medium", url: "[https://leetcode.com/problems/reorder-list/](https://leetcode.com/problems/reorder-list/)" },
  { slug: "reverse-k-group", label: "Reverse Nodes in k-Group", category: "Linked Lists", difficulty: "Hard", url: "[https://leetcode.com/problems/reverse-nodes-in-k-group/](https://leetcode.com/problems/reverse-nodes-in-k-group/)" },

  // --- MODULE 8: RECURSION & BACKTRACKING ---
  { slug: "reverse-string-rec", label: "Reverse String", category: "Backtracking", difficulty: "Easy", url: "[https://leetcode.com/problems/reverse-string/](https://leetcode.com/problems/reverse-string/)" },
  { slug: "generate-parentheses", label: "Generate Parentheses", category: "Backtracking", difficulty: "Medium", url: "[https://leetcode.com/problems/generate-parentheses/](https://leetcode.com/problems/generate-parentheses/)" },
  { slug: "subsets", label: "Subsets", category: "Backtracking", difficulty: "Medium", url: "[https://leetcode.com/problems/subsets/](https://leetcode.com/problems/subsets/)" },
  { slug: "combination-sum", label: "Combination Sum", category: "Backtracking", difficulty: "Medium", url: "[https://leetcode.com/problems/combination-sum/](https://leetcode.com/problems/combination-sum/)" },
  { slug: "combination-sum-ii", label: "Combination Sum II", category: "Backtracking", difficulty: "Medium", url: "[https://leetcode.com/problems/combination-sum-ii/](https://leetcode.com/problems/combination-sum-ii/)" },
  { slug: "permutations", label: "Permutations", category: "Backtracking", difficulty: "Medium", url: "[https://leetcode.com/problems/permutations/](https://leetcode.com/problems/permutations/)" },
  { slug: "permutations-ii", label: "Permutations II", category: "Backtracking", difficulty: "Medium", url: "[https://leetcode.com/problems/permutations-ii/](https://leetcode.com/problems/permutations-ii/)" },
  { slug: "n-queens", label: "N-Queens", category: "Backtracking", difficulty: "Hard", url: "[https://leetcode.com/problems/n-queens/](https://leetcode.com/problems/n-queens/)" },
  { slug: "sudoku-solver", label: "Sudoku Solver", category: "Backtracking", difficulty: "Hard", url: "[https://leetcode.com/problems/sudoku-solver/](https://leetcode.com/problems/sudoku-solver/)" },

  // --- MODULE 9: GREEDY ---
  { slug: "activity-selection", label: "Activity Selection", category: "Greedy", difficulty: "Easy", url: "[https://www.geeksforgeeks.org/problems/activity-selection-1587115620/1](https://www.geeksforgeeks.org/problems/activity-selection-1587115620/1)" },
  { slug: "min-coins-greedy", label: "Minimum Number of Coins", category: "Greedy", difficulty: "Easy", url: "[https://www.geeksforgeeks.org/problems/-minimum-number-of-coins4426/1](https://www.geeksforgeeks.org/problems/-minimum-number-of-coins4426/1)" },
  { slug: "jump-game", label: "Jump Game", category: "Greedy", difficulty: "Medium", url: "[https://leetcode.com/problems/jump-game/](https://leetcode.com/problems/jump-game/)" },
  { slug: "min-arrows-balloons", label: "Arrows to Burst Balloons", category: "Greedy", difficulty: "Medium", url: "[https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/](https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/)" },
  { slug: "gas-station", label: "Gas Station", category: "Greedy", difficulty: "Medium", url: "[https://leetcode.com/problems/gas-station/](https://leetcode.com/problems/gas-station/)" },
  { slug: "minimum-platforms", label: "Minimum Platforms", category: "Greedy", difficulty: "Medium", url: "[https://www.geeksforgeeks.org/problems/minimum-platforms-1587115620/1](https://www.geeksforgeeks.org/problems/minimum-platforms-1587115620/1)" },
  { slug: "jump-game-ii", label: "Jump Game II", category: "Greedy", difficulty: "Medium", url: "[https://leetcode.com/problems/jump-game-ii/](https://leetcode.com/problems/jump-game-ii/)" },
  { slug: "partition-labels", label: "Partition Labels", category: "Greedy", difficulty: "Medium", url: "[https://leetcode.com/problems/partition-labels/](https://leetcode.com/problems/partition-labels/)" },
  { slug: "assign-cookies", label: "Assign Cookies", category: "Greedy", difficulty: "Easy", url: "[https://leetcode.com/problems/assign-cookies/](https://leetcode.com/problems/assign-cookies/)" },
  { slug: "candy", label: "Candy", category: "Greedy", difficulty: "Hard", url: "[https://leetcode.com/problems/candy/](https://leetcode.com/problems/candy/)" },

  // --- MODULE 10: TREES & BST ---
  { slug: "tree-preorder", label: "Binary Tree Preorder Traversal", category: "Trees", difficulty: "Easy", url: "[https://leetcode.com/problems/binary-tree-preorder-traversal/](https://leetcode.com/problems/binary-tree-preorder-traversal/)" },
  { slug: "tree-inorder", label: "Binary Tree Inorder Traversal", category: "Trees", difficulty: "Easy", url: "[https://leetcode.com/problems/binary-tree-inorder-traversal/](https://leetcode.com/problems/binary-tree-inorder-traversal/)" },
  { slug: "tree-postorder", label: "Binary Tree Postorder Traversal", category: "Trees", difficulty: "Easy", url: "[https://leetcode.com/problems/binary-tree-postorder-traversal/](https://leetcode.com/problems/binary-tree-postorder-traversal/)" },
  { slug: "tree-level-order", label: "Binary Tree Level Order Traversal", category: "Trees", difficulty: "Medium", url: "[https://leetcode.com/problems/binary-tree-level-order-traversal/](https://leetcode.com/problems/binary-tree-level-order-traversal/)" },
  { slug: "max-depth-tree", label: "Maximum Depth of Binary Tree", category: "Trees", difficulty: "Easy", url: "[https://leetcode.com/problems/maximum-depth-of-binary-tree/](https://leetcode.com/problems/maximum-depth-of-binary-tree/)" },
  { slug: "same-tree", label: "Same Tree", category: "Trees", difficulty: "Easy", url: "[https://leetcode.com/problems/same-tree/](https://leetcode.com/problems/same-tree/)" },
  { slug: "invert-tree", label: "Invert Binary Tree", category: "Trees", difficulty: "Easy", url: "[https://leetcode.com/problems/invert-binary-tree/](https://leetcode.com/problems/invert-binary-tree/)" },
  { slug: "diameter-tree", label: "Diameter of Binary Tree", category: "Trees", difficulty: "Easy", url: "[https://leetcode.com/problems/diameter-of-binary-tree/](https://leetcode.com/problems/diameter-of-binary-tree/)" },
  { slug: "min-depth-tree", label: "Minimum Depth of Binary Tree", category: "Trees", difficulty: "Easy", url: "[https://leetcode.com/problems/minimum-depth-of-binary-tree/](https://leetcode.com/problems/minimum-depth-of-binary-tree/)" },
  { slug: "path-sum", label: "Path Sum", category: "Trees", difficulty: "Easy", url: "[https://leetcode.com/problems/path-sum/](https://leetcode.com/problems/path-sum/)" },
  { slug: "path-sum-ii", label: "Path Sum II", category: "Trees", difficulty: "Medium", url: "[https://leetcode.com/problems/path-sum-ii/](https://leetcode.com/problems/path-sum-ii/)" },
  { slug: "right-side-view", label: "Binary Tree Right Side View", category: "Trees", difficulty: "Medium", url: "[https://leetcode.com/problems/binary-tree-right-side-view/](https://leetcode.com/problems/binary-tree-right-side-view/)" },
  { slug: "lca-binary-tree", label: "Lowest Common Ancestor in Binary Tree", category: "Trees", difficulty: "Medium", url: "[https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/)" },
  { slug: "left-view-tree", label: "Left View of Binary Tree", category: "Trees", difficulty: "Easy", url: "[https://www.geeksforgeeks.org/problems/left-view-of-binary-tree/1](https://www.geeksforgeeks.org/problems/left-view-of-binary-tree/1)" },
  { slug: "top-view-tree", label: "Top View of Binary Tree", category: "Trees", difficulty: "Medium", url: "[https://www.geeksforgeeks.org/problems/top-view-of-binary-tree/1](https://www.geeksforgeeks.org/problems/top-view-of-binary-tree/1)" },
  { slug: "bottom-view-tree", label: "Bottom View of Binary Tree", category: "Trees", difficulty: "Medium", url: "[https://www.geeksforgeeks.org/problems/bottom-view-of-binary-tree/1](https://www.geeksforgeeks.org/problems/bottom-view-of-binary-tree/1)" },
  { slug: "diagonal-traversal-tree", label: "Diagonal Traversal of Binary Tree", category: "Trees", difficulty: "Medium", url: "[https://www.geeksforgeeks.org/problems/diagonal-traversal-of-binary-tree/1](https://www.geeksforgeeks.org/problems/diagonal-traversal-of-binary-tree/1)" },
  { slug: "vertical-order-traversal", label: "Vertical Order Traversal", category: "Trees", difficulty: "Hard", url: "[https://leetcode.com/problems/vertical-order-traversal-of-a-binary-tree/](https://leetcode.com/problems/vertical-order-traversal-of-a-binary-tree/)" },
  { slug: "insert-bst", label: "Insert into a Binary Search Tree", category: "Trees", difficulty: "Medium", url: "[https://leetcode.com/problems/insert-into-a-binary-search-tree/](https://leetcode.com/problems/insert-into-a-binary-search-tree/)" },
  { slug: "delete-node-bst", label: "Delete Node in a BST", category: "Trees", difficulty: "Medium", url: "[https://leetcode.com/problems/delete-node-in-a-bst/](https://leetcode.com/problems/delete-node-in-a-bst/)" },
  { slug: "validate-bst", label: "Validate Binary Search Tree", category: "Trees", difficulty: "Medium", url: "[https://leetcode.com/problems/validate-binary-search-tree/](https://leetcode.com/problems/validate-binary-search-tree/)" },
  { slug: "recover-bst", label: "Recover Binary Search Tree", category: "Trees", difficulty: "Medium", url: "[https://leetcode.com/problems/recover-binary-search-tree/](https://leetcode.com/problems/recover-binary-search-tree/)" },
  { slug: "max-path-sum", label: "Binary Tree Maximum Path Sum", category: "Trees", difficulty: "Hard", url: "[https://leetcode.com/problems/binary-tree-maximum-path-sum/](https://leetcode.com/problems/binary-tree-maximum-path-sum/)" },

  // --- MODULE 11: HEAPS & PRIORITY QUEUES ---
  { slug: "kth-largest-array", label: "Kth Largest Element in an Array", category: "Heaps", difficulty: "Medium", url: "[https://leetcode.com/problems/kth-largest-element-in-an-array/](https://leetcode.com/problems/kth-largest-element-in-an-array/)" },
  { slug: "top-k-frequent", label: "Top K Frequent Elements", category: "Heaps", difficulty: "Medium", url: "[https://leetcode.com/problems/top-k-frequent-elements/](https://leetcode.com/problems/top-k-frequent-elements/)" },
  { slug: "k-closest-points", label: "K Closest Points to Origin", category: "Heaps", difficulty: "Medium", url: "[https://leetcode.com/problems/k-closest-points-to-origin/](https://leetcode.com/problems/k-closest-points-to-origin/)" },
  { slug: "merge-k-lists", label: "Merge k Sorted Lists", category: "Heaps", difficulty: "Hard", url: "[https://leetcode.com/problems/merge-k-sorted-lists/](https://leetcode.com/problems/merge-k-sorted-lists/)" },
  { slug: "find-k-pairs-smallest-sums", label: "Find K Pairs with Smallest Sums", category: "Heaps", difficulty: "Medium", url: "[https://leetcode.com/problems/find-k-pairs-with-smallest-sums/](https://leetcode.com/problems/find-k-pairs-with-smallest-sums/)" },
  { slug: "median-data-stream", label: "Find Median from Data Stream", category: "Heaps", difficulty: "Hard", url: "[https://leetcode.com/problems/find-median-from-data-stream/](https://leetcode.com/problems/find-median-from-data-stream/)" },
  { slug: "sliding-window-median", label: "Sliding Window Median", category: "Heaps", difficulty: "Hard", url: "[https://leetcode.com/problems/sliding-window-median/](https://leetcode.com/problems/sliding-window-median/)" },
  { slug: "ipo-heap", label: "IPO", category: "Heaps", difficulty: "Hard", url: "[https://leetcode.com/problems/ipo/](https://leetcode.com/problems/ipo/)" },

  // --- MODULE 12: DYNAMIC PROGRAMMING ---
  { slug: "fibonacci-number", label: "Fibonacci Number", category: "Dynamic Programming", difficulty: "Easy", url: "[https://leetcode.com/problems/fibonacci-number/](https://leetcode.com/problems/fibonacci-number/)" },
  { slug: "climbing-stairs", label: "Climbing Stairs", category: "Dynamic Programming", difficulty: "Easy", url: "[https://leetcode.com/problems/climbing-stairs/](https://leetcode.com/problems/climbing-stairs/)" },
  { slug: "house-robber", label: "House Robber", category: "Dynamic Programming", difficulty: "Medium", url: "[https://leetcode.com/problems/house-robber/](https://leetcode.com/problems/house-robber/)" },
  { slug: "house-robber-ii", label: "House Robber II", category: "Dynamic Programming", difficulty: "Medium", url: "[https://leetcode.com/problems/house-robber-ii/](https://leetcode.com/problems/house-robber-ii/)" },
  { slug: "delete-and-earn", label: "Delete and Earn", category: "Dynamic Programming", difficulty: "Medium", url: "[https://leetcode.com/problems/delete-and-earn/](https://leetcode.com/problems/delete-and-earn/)" },
  { slug: "partition-equal-subset-sum", label: "Partition Equal Subset Sum", category: "Dynamic Programming", difficulty: "Medium", url: "[https://leetcode.com/problems/partition-equal-subset-sum/](https://leetcode.com/problems/partition-equal-subset-sum/)" },
  { slug: "coin-change", label: "Coin Change", category: "Dynamic Programming", difficulty: "Medium", url: "[https://leetcode.com/problems/coin-change/](https://leetcode.com/problems/coin-change/)" },
  { slug: "coin-change-ii", label: "Coin Change II", category: "Dynamic Programming", difficulty: "Medium", url: "[https://leetcode.com/problems/coin-change-ii/](https://leetcode.com/problems/coin-change-ii/)" },
  { slug: "decode-ways", label: "Decode Ways", category: "Dynamic Programming", difficulty: "Medium", url: "[https://leetcode.com/problems/decode-ways/](https://leetcode.com/problems/decode-ways/)" },
  { slug: "max-product-subarray", label: "Maximum Product Subarray", category: "Dynamic Programming", difficulty: "Medium", url: "[https://leetcode.com/problems/maximum-product-subarray/](https://leetcode.com/problems/maximum-product-subarray/)" },
  { slug: "word-break", label: "Word Break", category: "Dynamic Programming", difficulty: "Medium", url: "[https://leetcode.com/problems/word-break/](https://leetcode.com/problems/word-break/)" },
  { slug: "lcs", label: "Longest Common Subsequence", category: "Dynamic Programming", difficulty: "Medium", url: "[https://leetcode.com/problems/longest-common-subsequence/](https://leetcode.com/problems/longest-common-subsequence/)" },
  { slug: "edit-distance", label: "Edit Distance", category: "Dynamic Programming", difficulty: "Medium", url: "[https://leetcode.com/problems/edit-distance/](https://leetcode.com/problems/edit-distance/)" },
  { slug: "unique-paths", label: "Unique Paths", category: "Dynamic Programming", difficulty: "Medium", url: "[https://leetcode.com/problems/unique-paths/](https://leetcode.com/problems/unique-paths/)" },
  { slug: "unique-paths-ii", label: "Unique Paths II", category: "Dynamic Programming", difficulty: "Medium", url: "[https://leetcode.com/problems/unique-paths-ii/](https://leetcode.com/problems/unique-paths-ii/)" },
  { slug: "min-path-sum", label: "Minimum Path Sum", category: "Dynamic Programming", difficulty: "Medium", url: "[https://leetcode.com/problems/minimum-path-sum/](https://leetcode.com/problems/minimum-path-sum/)" },
  { slug: "min-falling-path-sum", label: "Minimum Falling Path Sum", category: "Dynamic Programming", difficulty: "Medium", url: "[https://leetcode.com/problems/minimum-falling-path-sum/](https://leetcode.com/problems/minimum-falling-path-sum/)" },
  { slug: "out-of-boundary-paths", label: "Out of Boundary Paths", category: "Dynamic Programming", difficulty: "Medium", url: "[https://leetcode.com/problems/out-of-boundary-paths/](https://leetcode.com/problems/out-of-boundary-paths/)" },
  { slug: "stock-ii", label: "Best Time to Buy & Sell Stock II", category: "Dynamic Programming", difficulty: "Medium", url: "[https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/)" },
  { slug: "stock-fee", label: "Stock with Transaction Fee", category: "Dynamic Programming", difficulty: "Medium", url: "[https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/)" },
  { slug: "stock-cooldown", label: "Stock with Cooldown", category: "Dynamic Programming", difficulty: "Medium", url: "[https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/)" },
  { slug: "knapsack-01", label: "0/1 Knapsack Problem", category: "Dynamic Programming", difficulty: "Medium", url: "[https://www.geeksforgeeks.org/problems/0-1-knapsack-problem0945/1](https://www.geeksforgeeks.org/problems/0-1-knapsack-problem0945/1)" },
  { slug: "rod-cutting", label: "Rod Cutting", category: "Dynamic Programming", difficulty: "Medium", url: "[https://www.geeksforgeeks.org/problems/rod-cutting0840/1](https://www.geeksforgeeks.org/problems/rod-cutting0840/1)" },
  { slug: "lis", label: "Longest Increasing Subsequence", category: "Dynamic Programming", difficulty: "Medium", url: "[https://leetcode.com/problems/longest-increasing-subsequence/](https://leetcode.com/problems/longest-increasing-subsequence/)" },
  { slug: "interleaving-string", label: "Interleaving String", category: "Dynamic Programming", difficulty: "Medium", url: "[https://leetcode.com/problems/interleaving-string/](https://leetcode.com/problems/interleaving-string/)" },
  { slug: "palindromic-substrings", label: "Palindromic Substrings", category: "Dynamic Programming", difficulty: "Medium", url: "[https://leetcode.com/problems/palindromic-substrings/](https://leetcode.com/problems/palindromic-substrings/)" },
  { slug: "russian-doll-envelopes", label: "Russian Doll Envelopes", category: "Dynamic Programming", difficulty: "Hard", url: "[https://leetcode.com/problems/russian-doll-envelopes/](https://leetcode.com/problems/russian-doll-envelopes/)" },

  // --- MODULE 13: BIT MANIPULATION ---
  { slug: "number-1-bits", label: "Number of 1 Bits", category: "Bit Manipulation", difficulty: "Easy", url: "[https://leetcode.com/problems/number-of-1-bits/](https://leetcode.com/problems/number-of-1-bits/)" },
  { slug: "single-number", label: "Single Number", category: "Bit Manipulation", difficulty: "Easy", url: "[https://leetcode.com/problems/single-number/](https://leetcode.com/problems/single-number/)" },
  { slug: "reverse-bits", label: "Reverse Bits", category: "Bit Manipulation", difficulty: "Easy", url: "[https://leetcode.com/problems/reverse-bits/](https://leetcode.com/problems/reverse-bits/)" },
  { slug: "single-number-ii", label: "Single Number II", category: "Bit Manipulation", difficulty: "Medium", url: "[https://leetcode.com/problems/single-number-ii/](https://leetcode.com/problems/single-number-ii/)" },
  { slug: "neighboring-bitwise-xor", label: "Neighboring Bitwise XOR", category: "Bit Manipulation", difficulty: "Medium", url: "[https://leetcode.com/problems/neighboring-bitwise-xor/](https://leetcode.com/problems/neighboring-bitwise-xor/)" },
  { slug: "total-hamming-distance", label: "Total Hamming Distance", category: "Bit Manipulation", difficulty: "Medium", url: "[https://leetcode.com/problems/total-hamming-distance/](https://leetcode.com/problems/total-hamming-distance/)" },
  { slug: "letter-case-permutation", label: "Letter Case Permutation", category: "Bit Manipulation", difficulty: "Medium", url: "[https://leetcode.com/problems/letter-case-permutation/](https://leetcode.com/problems/letter-case-permutation/)" },
  { slug: "min-flips-or", label: "Min Flips to Make a OR b == c", category: "Bit Manipulation", difficulty: "Medium", url: "[https://leetcode.com/problems/minimum-flips-to-make-a-or-b-equal-to-c/](https://leetcode.com/problems/minimum-flips-to-make-a-or-b-equal-to-c/)" },

  // --- MODULE 14: GRAPH ALGORITHMS ---
  { slug: "graph-dfs-traversal", label: "Depth First Traversal", category: "Graphs", difficulty: "Easy", url: "[https://www.geeksforgeeks.org/problems/depth-first-traversal-for-a-graph/1](https://www.geeksforgeeks.org/problems/depth-first-traversal-for-a-graph/1)" },
  { slug: "adjacency-list-impl", label: "Implementation of Adjacency List", category: "Graphs", difficulty: "Easy", url: "[https://www.geeksforgeeks.org/java/java-program-to-implement-adjacency-list/](https://www.geeksforgeeks.org/java/java-program-to-implement-adjacency-list/)" },
  { slug: "graph-bfs-traversal", label: "BFS Traversal", category: "Graphs", difficulty: "Easy", url: "[https://www.geeksforgeeks.org/problems/bfs-traversal-of-graph/1](https://www.geeksforgeeks.org/problems/bfs-traversal-of-graph/1)" },
  { slug: "path-exists-graph", label: "Find if Path Exists", category: "Graphs", difficulty: "Easy", url: "[https://leetcode.com/problems/find-if-path-exists-in-graph/](https://leetcode.com/problems/find-if-path-exists-in-graph/)" },
  { slug: "keys-and-rooms", label: "Keys and Rooms", category: "Graphs", difficulty: "Medium", url: "[https://leetcode.com/problems/keys-and-rooms/](https://leetcode.com/problems/keys-and-rooms/)" },
  { slug: "all-paths-source-target", label: "All Paths Source to Target", category: "Graphs", difficulty: "Medium", url: "[https://leetcode.com/problems/all-paths-from-source-to-target/](https://leetcode.com/problems/all-paths-from-source-to-target/)" },
  { slug: "number-of-provinces", label: "Number of Provinces", category: "Graphs", difficulty: "Medium", url: "[https://leetcode.com/problems/number-of-provinces/](https://leetcode.com/problems/number-of-provinces/)" },
  { slug: "network-connected", label: "Operations to Make Network Connected", category: "Graphs", difficulty: "Medium", url: "[https://leetcode.com/problems/number-of-operations-to-make-network-connected/](https://leetcode.com/problems/number-of-operations-to-make-network-connected/)" },
  { slug: "flood-fill", label: "Flood Fill", category: "Graphs", difficulty: "Easy", url: "[https://leetcode.com/problems/flood-fill/](https://leetcode.com/problems/flood-fill/)" },
  { slug: "number-of-islands", label: "Number of Islands", category: "Graphs", difficulty: "Medium", url: "[https://leetcode.com/problems/number-of-islands/](https://leetcode.com/problems/number-of-islands/)" },
  { slug: "max-area-island", label: "Max Area of Island", category: "Graphs", difficulty: "Medium", url: "[https://leetcode.com/problems/max-area-of-island/](https://leetcode.com/problems/max-area-of-island/)" },
  { slug: "number-closed-islands", label: "Number of Closed Islands", category: "Graphs", difficulty: "Medium", url: "[https://leetcode.com/problems/number-of-closed-islands/](https://leetcode.com/problems/number-of-closed-islands/)" },
  { slug: "rotting-oranges", label: "Rotting Oranges", category: "Graphs", difficulty: "Medium", url: "[https://leetcode.com/problems/rotting-oranges/](https://leetcode.com/problems/rotting-oranges/)" },
  { slug: "01-matrix", label: "01 Matrix", category: "Graphs", difficulty: "Medium", url: "[https://leetcode.com/problems/01-matrix/](https://leetcode.com/problems/01-matrix/)" },
  { slug: "map-highest-peak", label: "Map of Highest Peak", category: "Graphs", difficulty: "Medium", url: "[https://leetcode.com/problems/map-of-highest-peak/](https://leetcode.com/problems/map-of-highest-peak/)" },
  { slug: "as-far-from-land", label: "As Far from Land as Possible", category: "Graphs", difficulty: "Medium", url: "[https://leetcode.com/problems/as-far-from-land-as-possible/](https://leetcode.com/problems/as-far-from-land-as-possible/)" },
  { slug: "detect-cycle-undirected", label: "Detect Cycle in Undirected Graph", category: "Graphs", difficulty: "Medium", url: "[https://www.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1](https://www.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1)" },
  { slug: "detect-cycle-directed", label: "Detect Cycle in Directed Graph", category: "Graphs", difficulty: "Medium", url: "[https://www.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1](https://www.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1)" },
  { slug: "topological-sort", label: "Topological Sort", category: "Graphs", difficulty: "Medium", url: "[https://www.geeksforgeeks.org/problems/topological-sort/1](https://www.geeksforgeeks.org/problems/topological-sort/1)" },
  { slug: "course-schedule", label: "Course Schedule", category: "Graphs", difficulty: "Medium", url: "[https://leetcode.com/problems/course-schedule/](https://leetcode.com/problems/course-schedule/)" },
  { slug: "course-schedule-ii", label: "Course Schedule II", category: "Graphs", difficulty: "Medium", url: "[https://leetcode.com/problems/course-schedule-ii/](https://leetcode.com/problems/course-schedule-ii/)" },
  { slug: "alien-dictionary", label: "Alien Dictionary", category: "Graphs", difficulty: "Hard", url: "[https://www.geeksforgeeks.org/problems/alien-dictionary/1](https://www.geeksforgeeks.org/problems/alien-dictionary/1)" },
  { slug: "is-graph-bipartite", label: "Is Graph Bipartite?", category: "Graphs", difficulty: "Medium", url: "[https://leetcode.com/problems/is-graph-bipartite/](https://leetcode.com/problems/is-graph-bipartite/)" },
  { slug: "possible-bipartition", label: "Possible Bipartition", category: "Graphs", difficulty: "Medium", url: "[https://leetcode.com/problems/possible-bipartition/](https://leetcode.com/problems/possible-bipartition/)" },
  { slug: "shortest-path-unit-dist", label: "Shortest Path Unit Distance", category: "Graphs", difficulty: "Medium", url: "[https://www.geeksforgeeks.org/problems/shortest-path-in-undirected-graph-having-unit-distance/1](https://www.geeksforgeeks.org/problems/shortest-path-in-undirected-graph-having-unit-distance/1)" },
  { slug: "dijkstra-algo", label: "Dijkstra Algorithm", category: "Graphs", difficulty: "Medium", url: "[https://www.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1](https://www.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1)" },
  { slug: "shortest-path-binary-matrix", label: "Shortest Path in Binary Matrix", category: "Graphs", difficulty: "Medium", url: "[https://leetcode.com/problems/shortest-path-in-binary-matrix/](https://leetcode.com/problems/shortest-path-in-binary-matrix/)" },
  { slug: "network-delay-time", label: "Network Delay Time", category: "Graphs", difficulty: "Medium", url: "[https://leetcode.com/problems/network-delay-time/](https://leetcode.com/problems/network-delay-time/)" },
  { slug: "path-min-effort", label: "Path With Minimum Effort", category: "Graphs", difficulty: "Medium", url: "[https://leetcode.com/problems/path-with-minimum-effort/](https://leetcode.com/problems/path-with-minimum-effort/)" },
  { slug: "redundant-connection", label: "Redundant Connection", category: "Graphs (DSU)", difficulty: "Medium", url: "[https://leetcode.com/problems/redundant-connection/](https://leetcode.com/problems/redundant-connection/)" },
  { slug: "mst-kruskal-prim", label: "Minimum Spanning Tree", category: "Graphs (MST)", difficulty: "Medium", url: "[https://www.geeksforgeeks.org/problems/minimum-spanning-tree/1](https://www.geeksforgeeks.org/problems/minimum-spanning-tree/1)" },
  { slug: "min-cost-connect-points", label: "Min Cost to Connect All Points", category: "Graphs (MST)", difficulty: "Medium", url: "[https://leetcode.com/problems/min-cost-to-connect-all-points/](https://leetcode.com/problems/min-cost-to-connect-all-points/)" },
  { slug: "bellman-ford", label: "Distance from the Source (Bellman-Ford)", category: "Graphs (Shortest Path)", difficulty: "Medium", url: "[https://www.geeksforgeeks.org/problems/distance-from-the-source-bellman-ford-algorithm/1](https://www.geeksforgeeks.org/problems/distance-from-the-source-bellman-ford-algorithm/1)" },
  { slug: "cheapest-flights-k-stops", label: "Cheapest Flights Within K Stops", category: "Graphs (Shortest Path)", difficulty: "Medium", url: "[https://leetcode.com/problems/cheapest-flights-within-k-stops/](https://leetcode.com/problems/cheapest-flights-within-k-stops/)" },
  { slug: "floyd-warshall", label: "Implementing Floyd Warshall", category: "Graphs (All-Pairs)", difficulty: "Medium", url: "[https://www.geeksforgeeks.org/problems/implementing-floyd-warshall2042/1](https://www.geeksforgeeks.org/problems/implementing-floyd-warshall2042/1)" },
  { slug: "city-smallest-neighbors", label: "Find City With Smallest Number of Neighbors", category: "Graphs (All-Pairs)", difficulty: "Medium", url: "[https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/](https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/)" },
  { slug: "course-schedule-iv", label: "Course Schedule IV", category: "Graphs (All-Pairs)", difficulty: "Medium", url: "[https://leetcode.com/problems/course-schedule-iv/](https://leetcode.com/problems/course-schedule-iv/)" },
  { slug: "scc-kosaraju", label: "Strongly Connected Components (Kosaraju)", category: "Graphs (SCC)", difficulty: "Medium", url: "[https://www.geeksforgeeks.org/problems/strongly-connected-components-kosarajus-algo/1](https://www.geeksforgeeks.org/problems/strongly-connected-components-kosarajus-algo/1)" },
  { slug: "max-employees-meeting", label: "Maximum Employees to Be Invited", category: "Graphs", difficulty: "Hard", url: "[https://leetcode.com/problems/maximum-employees-to-be-invited-to-a-meeting/](https://leetcode.com/problems/maximum-employees-to-be-invited-to-a-meeting/)" },
  { slug: "eventual-safe-states", label: "Find Eventual Safe States", category: "Graphs (Topo Sort)", difficulty: "Medium", url: "[https://leetcode.com/problems/find-eventual-safe-states/](https://leetcode.com/problems/find-eventual-safe-states/)" },

  // --- MODULE 15: SEGMENT TREES ---
  { slug: "range-sum-mutable", label: "Range Sum Query - Mutable", category: "Segment Trees", difficulty: "Medium", url: "[https://leetcode.com/problems/range-sum-query-mutable/](https://leetcode.com/problems/range-sum-query-mutable/)" },
  { slug: "range-min-query", label: "Range Minimum Query", category: "Segment Trees", difficulty: "Medium", url: "[https://www.geeksforgeeks.org/problems/range-minimum-query/1](https://www.geeksforgeeks.org/problems/range-minimum-query/1)" }
];

const rawSeedEdges = [
  // Arrays
  { from: "running-sum", to: "subarray-sum-k" },
  { from: "two-sum", to: "3sum" },
  { from: "two-sum", to: "subarray-sum-k" },
  { from: "max-subarray", to: "max-product-subarray" },
  { from: "subarray-sum-k", to: "contiguous-array" },
  { from: "subarray-sum-k", to: "subarray-div-k" },
  { from: "stock-1", to: "stock-ii" },

  // Cross-Module Foundation Dependencies: Arrays -> Sliding Window / DP
  { from: "running-sum", to: "longest-substr-no-repeat" },
  { from: "two-sum", to: "valid-palindrome" },
  { from: "max-subarray", to: "fibonacci-number" },
  { from: "binary-search", to: "tree-preorder" },
  { from: "tree-level-order", to: "graph-bfs-traversal" },

  // Maps / Windows
  { from: "contains-duplicate", to: "longest-consec-seq" },
  { from: "valid-anagram", to: "find-all-anagrams" },
  { from: "valid-palindrome", to: "container-water" },
  { from: "valid-palindrome", to: "longest-palindromic-substr" },
  { from: "container-water", to: "3sum" },
  { from: "longest-substr-no-repeat", to: "longest-repeat-char-replace" },
  { from: "longest-substr-no-repeat", to: "min-window-substr" },
  { from: "find-all-anagrams", to: "permutation-in-string" },

  // Binary Search
  { from: "binary-search", to: "search-insert-pos" },
  { from: "binary-search", to: "search-rotated-array" },
  { from: "binary-search", to: "koko-bananas" },
  { from: "search-insert-pos", to: "search-2d-matrix" },
  { from: "search-rotated-array", to: "find-min-rotated" },
  { from: "search-rotated-array", to: "median-two-sorted" },
  { from: "koko-bananas", to: "ship-packages-d-days" },
  { from: "ship-packages-d-days", to: "aggressive-cows" },
  
  // Stacks & Lists
  { from: "valid-parentheses", to: "decode-string" },
  { from: "valid-parentheses", to: "next-greater-i" },
  { from: "next-greater-i", to: "daily-temperatures" },
  { from: "daily-temperatures", to: "largest-histogram" },
  { from: "largest-histogram", to: "sliding-window-max" },
  { from: "reverse-linked-list", to: "middle-linked-list" },
  { from: "middle-linked-list", to: "linked-list-cycle" },
  { from: "reverse-linked-list", to: "palindrome-linked-list" },

  // Recursion & Trees
  { from: "reverse-string-rec", to: "generate-parentheses" },
  { from: "subsets", to: "combination-sum" },
  { from: "tree-preorder", to: "max-depth-tree" },
  { from: "max-depth-tree", to: "tree-level-order" },
  { from: "tree-level-order", to: "right-side-view" },
  { from: "max-depth-tree", to: "lca-binary-tree" },
  { from: "tree-inorder", to: "validate-bst" },

  // Heaps & DP
  { from: "kth-largest-array", to: "top-k-frequent" },
  { from: "top-k-frequent", to: "median-data-stream" },
  { from: "fibonacci-number", to: "climbing-stairs" },
  { from: "climbing-stairs", to: "house-robber" },
  { from: "subsets", to: "partition-equal-subset-sum" },
  { from: "climbing-stairs", to: "unique-paths" },
  { from: "unique-paths", to: "lcs" },
  { from: "lcs", to: "edit-distance" },
  { from: "lcs", to: "interleaving-string" },
  { from: "longest-palindromic-substr", to: "palindromic-substrings" },
  { from: "lis", to: "russian-doll-envelopes" },

  // Advanced Graphs
  { from: "adjacency-list-impl", to: "graph-bfs-traversal" },
  { from: "graph-bfs-traversal", to: "number-of-provinces" },
  { from: "number-of-provinces", to: "detect-cycle-undirected" },
  { from: "number-of-provinces", to: "redundant-connection" },
  { from: "redundant-connection", to: "mst-kruskal-prim" },
  { from: "mst-kruskal-prim", to: "min-cost-connect-points" },
  { from: "detect-cycle-directed", to: "topological-sort" },
  { from: "topological-sort", to: "course-schedule" },
  { from: "kth-largest-array", to: "dijkstra-algo" },
  { from: "dijkstra-algo", to: "network-delay-time" },
  { from: "dijkstra-algo", to: "bellman-ford" },
  { from: "bellman-ford", to: "floyd-warshall" },
  { from: "floyd-warshall", to: "city-smallest-neighbors" },
  { from: "floyd-warshall", to: "course-schedule-iv" },
  { from: "graph-dfs-traversal", to: "scc-kosaraju" },
  { from: "topological-sort", to: "eventual-safe-states" },
  { from: "bellman-ford", to: "cheapest-flights-k-stops" }
];

// Map Slugs -> Cleaned DSANode objects with UUID PKs & Cleaned URLs
const slugToUuidMap = new Map<string, string>();

export const seedNodes: DSANode[] = rawSeedNodes.map(raw => {
  const uuid = generateDeterministicUuid(raw.slug);
  slugToUuidMap.set(raw.slug, uuid);
  return {
    id: uuid,
    slug: raw.slug,
    label: raw.label,
    category: raw.category,
    difficulty: raw.difficulty as any,
    url: cleanUrl(raw.url), // Cleaned URL string
  };
});

// Map Edges using UUID PKs & Validate against Orphan Edges
const orphanEdges: { fromSlug: string; toSlug: string }[] = [];

export const seedEdges: DSAEdge[] = (rawSeedEdges
  .map(raw => {
    const fromId = slugToUuidMap.get(raw.from);
    const toId = slugToUuidMap.get(raw.to);

    if (!fromId || !toId) {
      orphanEdges.push({ fromSlug: raw.from, toSlug: raw.to });
      return null;
    }

    return {
      id: generateDeterministicUuid(`edge-${raw.from}->${raw.to}`),
      from: fromId,
      to: toId,
    };
  })
  .filter(Boolean) as DSAEdge[]);

if (orphanEdges.length > 0) {
  console.warn('Phase 0 Validation Warning: Orphan edges detected and flagged:', orphanEdges);
}
