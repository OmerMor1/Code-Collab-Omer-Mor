## Code Collaboration Platform

In the frontend, I implemented a comparison between the correct solution and the user's code. Initially, I compared the strings directly, but later I enhanced the comparison using AST (Abstract Syntax Tree) to account for different variable names while still ensuring logical equivalence. I also used the Monaco Editor to simulate the coding experience similar to VSCode.

In the backend, I utilized an external API, Online Code Compiler, to enable users to run their code and see the results directly within the platform.

Features I added:
- Hints that users can view to guide them towards the solution.
- In mentor view mode, I added the option for mentors to view the complete solution.
- The ability to run code using a compiler from an external API.

Features I would be happy to add in the future:
- Integration with Zoom to allow mentors to create Zoom meetings directly from the code blocks.
- Further development of the AST-based code checking to cover more cases.
