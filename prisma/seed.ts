import { PrismaClient } from "./generated-client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("Seeding comprehensive HireLytix learning tracks, tasks, and modules...");

  const pass = await bcrypt.hash("Student@123", 12);
  const rpass = await bcrypt.hash("Recruiter@123", 12);

  // 1. Create Core Students
  const s1 = await db.user.upsert({
    where: { email: "student@taskhive.demo" },
    update: {
      name: "Aarav Sharma",
      skills: "Python, React, TypeScript, Machine Learning, SQL, Next.js, Git",
      college: "HireLytix Institute of Technology",
      degree: "B.Tech",
      branch: "Artificial Intelligence & Data Science",
      semester: "8",
      graduationYear: 2026,
      bio: "Aspiring AI & Full-Stack Engineer passionate about GenAI systems, clean architecture, and modern web apps.",
      github: "github.com/aarav-sharma",
      linkedin: "linkedin.com/in/aarav-sharma"
    },
    create: {
      name: "Aarav Sharma",
      email: "student@taskhive.demo",
      passwordHash: pass,
      role: "STUDENT",
      phone: "+91 98765 43210",
      college: "HireLytix Institute of Technology",
      degree: "B.Tech",
      branch: "Artificial Intelligence & Data Science",
      semester: "8",
      graduationYear: 2026,
      skills: "Python, React, TypeScript, Machine Learning, SQL, Next.js, Git",
      bio: "Aspiring AI & Full-Stack Engineer passionate about GenAI systems, clean architecture, and modern web apps.",
      github: "github.com/aarav-sharma",
      linkedin: "linkedin.com/in/aarav-sharma"
    }
  });

  const s2 = await db.user.upsert({
    where: { email: "priya@taskhive.demo" },
    update: {},
    create: {
      name: "Priya Patel",
      email: "priya@taskhive.demo",
      passwordHash: pass,
      role: "STUDENT",
      phone: "+91 98765 12345",
      college: "National Institute of Technology",
      degree: "B.E.",
      branch: "Computer Science & Engineering",
      semester: "6",
      graduationYear: 2027,
      skills: "React, Next.js, CSS, TailwindCSS, TypeScript, UI/UX, Node.js",
      bio: "Frontend specialist who loves designing sleek micro-interactions and performant web experiences.",
      github: "github.com/priya-patel",
      linkedin: "linkedin.com/in/priya-patel"
    }
  });

  const s3 = await db.user.upsert({
    where: { email: "rohan@taskhive.demo" },
    update: {},
    create: {
      name: "Rohan Gupta",
      email: "rohan@taskhive.demo",
      passwordHash: pass,
      role: "STUDENT",
      phone: "+91 98765 67890",
      college: "Indian Institute of Information Technology",
      degree: "B.Tech",
      branch: "Information Technology",
      semester: "7",
      graduationYear: 2026,
      skills: "Node.js, PostgreSQL, Docker, AWS, Go, Distributed Systems, Python",
      bio: "Backend and cloud systems builder passionate about distributed databases and CI/CD pipelines.",
      github: "github.com/rohan-gupta",
      linkedin: "linkedin.com/in/rohan-gupta"
    }
  });

  // 2. Create Recruiters
  const ru1 = await db.user.upsert({
    where: { email: "recruiter@taskhive.demo" },
    update: {},
    create: {
      name: "Maya Recruiter",
      email: "recruiter@taskhive.demo",
      passwordHash: rpass,
      role: "RECRUITER"
    }
  });

  let rec1 = await db.recruiter.findUnique({ where: { userId: ru1.id } });
  if (!rec1) {
    rec1 = await db.recruiter.create({
      data: {
        userId: ru1.id,
        companyName: "NovaTech Labs",
        website: "https://novatechlabs.demo",
        description: "Leading AI research and generative product engineering studio."
      }
    });
  }

  const ru2 = await db.user.upsert({
    where: { email: "vikram@cloudscale.demo" },
    update: {},
    create: {
      name: "Vikram Mehta",
      email: "vikram@cloudscale.demo",
      passwordHash: rpass,
      role: "RECRUITER"
    }
  });

  let rec2 = await db.recruiter.findUnique({ where: { userId: ru2.id } });
  if (!rec2) {
    rec2 = await db.recruiter.create({
      data: {
        userId: ru2.id,
        companyName: "CloudScale Systems",
        website: "https://cloudscale.demo",
        description: "Enterprise multi-cloud orchestration and developer infrastructure platform."
      }
    });
  }

  // 3. Clear & Re-seed Assessments & Questions (All 8 Core Modules Unlocked)
  await db.question.deleteMany();
  await db.assessmentAttempt.deleteMany();
  await db.certificate.deleteMany();
  await db.assessment.deleteMany();

  const assessmentsData = [
    {
      title: "Python Fundamentals & OOP",
      education: "Engineering",
      course: "AI & Data Science / CSE",
      semester: "Sem 4",
      subject: "Python Programming",
      questions: [
        {
          text: "Which keyword is used to define an anonymous inline function in Python?",
          options: JSON.stringify(["func", "def", "lambda", "inline"]),
          correctIndex: 2,
          explanation: "`lambda` creates anonymous single-expression functions in Python.",
          difficulty: "Easy",
          marks: 1,
          topic: "Functions & Lambdas"
        },
        {
          text: "What does the expression `[x**2 for x in range(5) if x % 2 == 0]` evaluate to?",
          options: JSON.stringify(["[0, 4, 16]", "[1, 9]", "[0, 1, 4, 9, 16]", "[4, 16]"]),
          correctIndex: 0,
          explanation: "Even numbers in range(5) are 0, 2, 4. Their squares are 0, 4, and 16.",
          difficulty: "Medium",
          marks: 1,
          topic: "List Comprehensions"
        },
        {
          text: "Which OOP concept enables a derived class to invoke the constructor or method of its parent class?",
          options: JSON.stringify(["super()", "parent()", "inherit()", "base()"]),
          correctIndex: 0,
          explanation: "`super()` returns a proxy object that delegates method calls to a parent or sibling class.",
          difficulty: "Medium",
          marks: 1,
          topic: "Object-Oriented Programming"
        },
        {
          text: "Which built-in block is executed in Python whether an exception was raised or not?",
          options: JSON.stringify(["except", "else", "finally", "catch"]),
          correctIndex: 2,
          explanation: "The `finally` clause is always executed prior to leaving the `try` statement, ideal for cleanup.",
          difficulty: "Easy",
          marks: 1,
          topic: "Exception Handling"
        },
        {
          text: "What is the time complexity of looking up a key in a standard Python dictionary (average case)?",
          options: JSON.stringify(["O(1)", "O(log n)", "O(n)", "O(n log n)"]),
          correctIndex: 0,
          explanation: "Python dictionaries are implemented using hash tables with average O(1) key lookup time.",
          difficulty: "Medium",
          marks: 1,
          topic: "Data Structures & Time Complexity"
        }
      ]
    },
    {
      title: "Machine Learning & Generative AI Systems",
      education: "Engineering",
      course: "AI & Data Science",
      semester: "Sem 6",
      subject: "Machine Learning",
      questions: [
        {
          text: "Which mechanism in Transformer architectures calculates the contextual relationship between all tokens in a sequence?",
          options: JSON.stringify(["Recurrent Backprop", "Self-Attention", "Convolutional Pooling", "Batch Normalization"]),
          correctIndex: 1,
          explanation: "Scaled dot-product Self-Attention allows tokens to dynamically attend to every other token in the sequence.",
          difficulty: "Hard",
          marks: 1,
          topic: "Transformers & Attention"
        },
        {
          text: "When evaluating a classification model with heavy class imbalance (e.g. fraud detection), which metric is preferred over Accuracy?",
          options: JSON.stringify(["Mean Squared Error", "F1-Score / PR-AUC", "Mean Absolute Error", "R-squared"]),
          correctIndex: 1,
          explanation: "F1-Score (harmonic mean of Precision & Recall) and PR-AUC reflect true performance in imbalanced distributions.",
          difficulty: "Medium",
          marks: 1,
          topic: "Model Evaluation & Metrics"
        },
        {
          text: "What is the primary role of Temperature parameter when sampling completions from a Large Language Model?",
          options: JSON.stringify(["Controls response latency", "Controls randomness and creativity of probability distribution", "Sets maximum token output length", "Fine-tunes the weights permanently"]),
          correctIndex: 1,
          explanation: "Higher temperature flattens logits (more creative/diverse), while lower temperature sharpens logits (more deterministic).",
          difficulty: "Medium",
          marks: 1,
          topic: "LLMs & Prompt Engineering"
        },
        {
          text: "Which regularization technique randomly deactivates neurons during neural network training to prevent overfitting?",
          options: JSON.stringify(["Gradient Clipping", "Dropout", "Early Stopping", "Learning Rate Warmup"]),
          correctIndex: 1,
          explanation: "Dropout randomly sets a fraction of input units to 0 at each update during training time.",
          difficulty: "Easy",
          marks: 1,
          topic: "Neural Network Regularization"
        },
        {
          text: "In Retrieval-Augmented Generation (RAG), how are external document chunks matched with a user query?",
          options: JSON.stringify(["Regular Expression match", "Cosine similarity between dense vector embeddings", "Alphabetical indexing", "MD5 Hash comparison"]),
          correctIndex: 1,
          explanation: "RAG calculates semantic cosine similarity between the query embedding vector and stored vector embeddings.",
          difficulty: "Hard",
          marks: 1,
          topic: "RAG & Vector Embeddings"
        }
      ]
    },
    {
      title: "Modern Frontend with React & Next.js Architecture",
      education: "Engineering",
      course: "Computer Science",
      semester: "Sem 5",
      subject: "Web Technologies",
      questions: [
        {
          text: "In Next.js App Router (Next 13/14/15), what is the default rendering paradigm for components inside the app directory?",
          options: JSON.stringify(["Client Components", "React Server Components (RSC)", "Static HTML only", "Pure Web Components"]),
          correctIndex: 1,
          explanation: "All components in Next.js App Router are React Server Components by default unless marked with 'use client'.",
          difficulty: "Easy",
          marks: 1,
          topic: "Next.js Architecture"
        },
        {
          text: "Which React hook is designed to memoize an expensive calculated value between re-renders?",
          options: JSON.stringify(["useEffect", "useCallback", "useMemo", "useRef"]),
          correctIndex: 2,
          explanation: "`useMemo` caches the result of a calculation between renders until its dependency array changes.",
          difficulty: "Easy",
          marks: 1,
          topic: "React Hooks"
        },
        {
          text: "Why should you avoid using array index as `key` prop in dynamic lists when items can be reordered or deleted?",
          options: JSON.stringify(["It triggers memory leaks", "It can cause incorrect component state and rendering glitches during reconciliation", "React does not allow numbers as keys", "It disables CSS styles"]),
          correctIndex: 1,
          explanation: "Stable unique IDs allow React's Virtual DOM reconciliation algorithm to accurately identify which elements changed.",
          difficulty: "Medium",
          marks: 1,
          topic: "Virtual DOM & Reconciliation"
        },
        {
          text: "What directive is required at the top of a file to handle user events like `onClick` or use `useState` in Next.js App Router?",
          options: JSON.stringify(["'use server'", "'use client'", "'use dynamic'", "'use interactive'"]),
          correctIndex: 1,
          explanation: "The `'use client'` boundary indicates that the module and its dependencies run on the browser client.",
          difficulty: "Easy",
          marks: 1,
          topic: "Next.js Client Boundaries"
        },
        {
          text: "In modern CSS and responsive layouts, what CSS feature allows styling a parent container based on its child selector?",
          options: JSON.stringify([":is()", ":has()", ":where()", ":nth-child()"]),
          correctIndex: 1,
          explanation: "The `:has()` relational pseudo-class represents an element if any of the relative selectors match when anchored on it.",
          difficulty: "Hard",
          marks: 1,
          topic: "Modern CSS & Layouts"
        }
      ]
    },
    {
      title: "Backend API Engineering & Microservices",
      education: "Engineering",
      course: "Software Engineering",
      semester: "Sem 5",
      subject: "Backend & Systems",
      questions: [
        {
          text: "Which HTTP status code should be returned when a client makes a valid request to create a resource and it is created successfully?",
          options: JSON.stringify(["200 OK", "201 Created", "204 No Content", "301 Moved"]),
          correctIndex: 1,
          explanation: "HTTP 201 Created indicates that the request has succeeded and led to the creation of a new resource.",
          difficulty: "Easy",
          marks: 1,
          topic: "RESTful API Standards"
        },
        {
          text: "In Node.js, how does the single-threaded Event Loop handle asynchronous I/O operations without blocking the main thread?",
          options: JSON.stringify(["By spawning a new V8 process for each request", "Via libuv thread pool and non-blocking system calls", "By pausing Javascript execution until I/O returns", "Through hardware interrupts"]),
          correctIndex: 1,
          explanation: "Node.js relies on libuv to delegate filesystem, DNS, and network I/O to system kernel or thread pools.",
          difficulty: "Hard",
          marks: 1,
          topic: "Node.js Event Loop & Libuv"
        },
        {
          text: "Which property in JWT (JSON Web Token) cookie configuration prevents client-side Javascript from reading the token (protecting against XSS)?",
          options: JSON.stringify(["Secure", "SameSite=Strict", "HttpOnly", "Domain"]),
          correctIndex: 2,
          explanation: "The `HttpOnly` flag prevents client-side scripts from accessing the cookie via `document.cookie`.",
          difficulty: "Medium",
          marks: 1,
          topic: "Auth & Security"
        },
        {
          text: "What architectural pattern breaks a monolithic backend into loosely coupled, independently deployable services?",
          options: JSON.stringify(["Microservices", "Event-Sourcing Monolith", "Client-Side Rendering", "Layered Monolith"]),
          correctIndex: 0,
          explanation: "Microservices architecture arranges an application as a collection of loosely coupled services communicate over network.",
          difficulty: "Easy",
          marks: 1,
          topic: "Microservices Architecture"
        },
        {
          text: "In high-traffic backend systems, what is the 'Cache-Aside' (Lazy Loading) pattern?",
          options: JSON.stringify(["Application writes to cache only and never writes to DB", "Application checks cache first; on miss, reads DB and populates cache", "Database automatically syncs to cache asynchronously", "Cache is invalidated every 1 second"]),
          correctIndex: 1,
          explanation: "In Cache-Aside, the application first queries the cache; if not found, it queries the DB and updates the cache.",
          difficulty: "Medium",
          marks: 1,
          topic: "Caching & Performance"
        }
      ]
    },
    {
      title: "Data Structures, Algorithms & Complexity",
      education: "Engineering",
      course: "Computer Science Core",
      semester: "Sem 3",
      subject: "Algorithms",
      questions: [
        {
          text: "What is the worst-case time complexity of standard QuickSort when the pivot is chosen poorly (e.g. already sorted array)?",
          options: JSON.stringify(["O(n)", "O(n log n)", "O(n²)", "O(log n)"]),
          correctIndex: 2,
          explanation: "Unbalanced partitions in QuickSort degrade the recursion depth to n, yielding O(n²) worst-case runtime.",
          difficulty: "Medium",
          marks: 1,
          topic: "Sorting Algorithms"
        },
        {
          text: "Which data structure is ideal for implementing Breadth-First Search (BFS) on a graph?",
          options: JSON.stringify(["Stack", "Queue", "Priority Queue", "Binary Search Tree"]),
          correctIndex: 1,
          explanation: "BFS explores nodes layer by layer in FIFO order, which is implemented using a Queue.",
          difficulty: "Easy",
          marks: 1,
          topic: "Graph Traversal"
        },
        {
          text: "In Dynamic Programming, what two essential properties must a problem have to be solvable using DP?",
          options: JSON.stringify(["Optimal Substructure and Overlapping Subproblems", "Greedy Choice and Sorting", "Divide and Conquer with Independent Subproblems", "Randomized state and hash collisions"]),
          correctIndex: 0,
          explanation: "DP solves problems by combining solutions to overlapping subproblems where subproblems have optimal substructure.",
          difficulty: "Hard",
          marks: 1,
          topic: "Dynamic Programming"
        },
        {
          text: "In a balanced Binary Search Tree (AVL or Red-Black Tree) with n elements, what is the time complexity to insert a node?",
          options: JSON.stringify(["O(1)", "O(log n)", "O(n)", "O(n log n)"]),
          correctIndex: 1,
          explanation: "Balanced BSTs guarantee height <= c * log(n), making search and insertion O(log n).",
          difficulty: "Medium",
          marks: 1,
          topic: "Trees & Balanced BSTs"
        },
        {
          text: "What algorithm is used to find the shortest path from a single source node to all other nodes in a graph with non-negative edge weights?",
          options: JSON.stringify(["Dijkstra's Algorithm", "Kruskal's Algorithm", "Floyd-Warshall Algorithm", "Tarjan's Algorithm"]),
          correctIndex: 0,
          explanation: "Dijkstra's algorithm uses a priority queue / min-heap to find single-source shortest paths in non-negative weighted graphs.",
          difficulty: "Medium",
          marks: 1,
          topic: "Shortest Path Algorithms"
        }
      ]
    },
    {
      title: "SQL, Database Engineering & Analytics",
      education: "Engineering",
      course: "Information Technology",
      semester: "Sem 4",
      subject: "Database Management Systems",
      questions: [
        {
          text: "Which SQL clause is used to filter aggregated data generated by a `GROUP BY` clause?",
          options: JSON.stringify(["WHERE", "HAVING", "ORDER BY", "FILTER"]),
          correctIndex: 1,
          explanation: "`HAVING` filters rows after aggregation, whereas `WHERE` filters rows before aggregation.",
          difficulty: "Easy",
          marks: 1,
          topic: "SQL Aggregations"
        },
        {
          text: "What does the 'I' in the ACID transaction properties stand for?",
          options: JSON.stringify(["Integrity", "Isolation", "Indexing", "Immutable"]),
          correctIndex: 1,
          explanation: "ACID stands for Atomicity, Consistency, Isolation, and Durability in relational database transactions.",
          difficulty: "Easy",
          marks: 1,
          topic: "ACID Properties"
        },
        {
          text: "Which SQL Window function assigns a unique sequential integer to rows within a partition without gaps?",
          options: JSON.stringify(["RANK()", "DENSE_RANK()", "ROW_NUMBER()", "NTILE()"]),
          correctIndex: 2,
          explanation: "`ROW_NUMBER()` assigns an ascending sequential number (1, 2, 3...) to each row in the window partition.",
          difficulty: "Medium",
          marks: 1,
          topic: "Window Functions"
        },
        {
          text: "Why are B-Tree indexes particularly effective for relational database column lookups and range scans?",
          options: JSON.stringify(["They only store integer values", "They keep data sorted with balanced depth, allowing O(log N) searches and efficient range traversal", "They eliminate the need for primary keys", "They use zero disk storage"]),
          correctIndex: 1,
          explanation: "B-Trees maintain self-balancing sorted keys with sequential leaf node pointers, enabling fast point and range queries.",
          difficulty: "Hard",
          marks: 1,
          topic: "Indexing & Query Optimization"
        },
        {
          text: "What is the purpose of a Common Table Expression (CTE) defined with `WITH` keyword in SQL?",
          options: JSON.stringify(["To create a temporary named result set that simplifies complex joins and recursive queries", "To create permanent schema migrations", "To encrypt user password columns", "To force sequential table scans"]),
          correctIndex: 0,
          explanation: "CTEs provide readable temporary result sets that can be referenced within a single SELECT, INSERT, UPDATE, or DELETE.",
          difficulty: "Medium",
          marks: 1,
          topic: "CTEs & Advanced SQL"
        }
      ]
    },
    {
      title: "Cloud Infrastructure, Docker & DevOps",
      education: "Engineering",
      course: "Cloud Computing & DevOps",
      semester: "Sem 7",
      subject: "DevOps & Cloud Architecture",
      questions: [
        {
          text: "Why is multi-stage Docker build recommended for production container images?",
          options: JSON.stringify(["To run multiple OS kernels concurrently", "To separate build-time dependencies from the minimal runtime image, reducing size and security footprint", "To bypass container networking limits", "To run without a Docker daemon"]),
          correctIndex: 1,
          explanation: "Multi-stage builds leave compiler toolchains in intermediate stages, producing slim, secure runtime images.",
          difficulty: "Medium",
          marks: 1,
          topic: "Docker Containerization"
        },
        {
          text: "In Kubernetes, what is the smallest deployable computing unit that can be created and managed?",
          options: JSON.stringify(["Cluster", "Node", "Pod", "Service"]),
          correctIndex: 2,
          explanation: "A Pod represents a single instance of a running process in a cluster and encapsulates one or more containers.",
          difficulty: "Easy",
          marks: 1,
          topic: "Kubernetes Fundamentals"
        },
        {
          text: "What deployment strategy deploys a new version alongside the current version and switches 100% traffic via router when verified?",
          options: JSON.stringify(["Rolling Update", "Blue-Green Deployment", "Shadow Deployment", "Recreate Deployment"]),
          correctIndex: 1,
          explanation: "Blue-Green deployment provisions two identical environments and switches traffic instantly with zero downtime.",
          difficulty: "Medium",
          marks: 1,
          topic: "CI/CD & Deployment Strategies"
        },
        {
          text: "What is the primary objective of Infrastructure as Code (IaC) tools like Terraform?",
          options: JSON.stringify(["To manage container CPU runtime", "To provision, version, and manage cloud infrastructure using declarative configuration files", "To replace SQL databases with files", "To compile frontend web apps"]),
          correctIndex: 1,
          explanation: "IaC enables automated, repeatable, and idempotent infrastructure provisioning across cloud providers.",
          difficulty: "Easy",
          marks: 1,
          topic: "Infrastructure as Code"
        },
        {
          text: "In high availability cloud architectures, what mechanism distributes incoming traffic across multiple backend instances?",
          options: JSON.stringify(["Reverse DNS", "Load Balancer", "NAT Gateway", "VPC Peering"]),
          correctIndex: 1,
          explanation: "Load balancers distribute network or application traffic evenly across multiple healthy backend servers.",
          difficulty: "Easy",
          marks: 1,
          topic: "Scalability & Load Balancing"
        }
      ]
    },
    {
      title: "Web Security, Authentication & OWASP Top 10",
      education: "Engineering",
      course: "Cybersecurity",
      semester: "Sem 6",
      subject: "Information Security",
      questions: [
        {
          text: "How do Parameterized Queries (Prepared Statements) prevent SQL Injection vulnerabilities?",
          options: JSON.stringify(["By encrypting database tables", "By treating user input strictly as literal data rather than executable SQL syntax", "By limiting query length to 50 characters", "By using GET instead of POST"]),
          correctIndex: 1,
          explanation: "Prepared statements pre-compile the SQL statement so that parameters are sent separately and never parsed as code.",
          difficulty: "Medium",
          marks: 1,
          topic: "SQL Injection Defense"
        },
        {
          text: "What vulnerability occurs when an attacker tricks an authenticated browser into submitting unauthorized actions to a trusted website?",
          options: JSON.stringify(["Cross-Site Scripting (XSS)", "Cross-Site Request Forgery (CSRF)", "Denial of Service (DoS)", "Server-Side Template Injection"]),
          correctIndex: 1,
          explanation: "CSRF exploits the trust a site has in the user's browser by sending state-changing requests with existing cookies.",
          difficulty: "Medium",
          marks: 1,
          topic: "CSRF & Cookie Protection"
        },
        {
          text: "Which password hashing algorithm includes an adaptive work factor (cost) and automatic salt generation?",
          options: JSON.stringify(["MD5", "SHA-256", "bcrypt", "Base64"]),
          correctIndex: 2,
          explanation: "bcrypt incorporates salting and a configurable computation cost factor to remain resilient against GPU cracking.",
          difficulty: "Easy",
          marks: 1,
          topic: "Password Hashing & Cryptography"
        },
        {
          text: "Which HTTP security header restricts what resources (scripts, images, stylesheets) the browser is allowed to load?",
          options: JSON.stringify(["X-Frame-Options", "Content-Security-Policy (CSP)", "Strict-Transport-Security (HSTS)", "Referrer-Policy"]),
          correctIndex: 1,
          explanation: "Content-Security-Policy helps prevent XSS and data injection attacks by restricting approved source origins.",
          difficulty: "Hard",
          marks: 1,
          topic: "Security Headers & CSP"
        },
        {
          text: "What is the primary defense against Stored and Reflected Cross-Site Scripting (XSS)?",
          options: JSON.stringify(["Context-aware output encoding and input sanitization", "Turning off HTTP POST requests", "Using longer domain names", "Adding passwords to all URLs"]),
          correctIndex: 0,
          explanation: "Output encoding ensures that untrusted data rendered in HTML context is treated as text, not executable script.",
          difficulty: "Medium",
          marks: 1,
          topic: "XSS Defense"
        }
      ]
    },
    {
      title: "Aptitude & Logical Reasoning Assessment",
      education: "All Streams",
      course: "Aptitude",
      semester: "Placement Prep",
      subject: "Quantitative & Logical Reasoning",
      questions: [
        { text: "A train travels 120 km in 2 hours. What is its average speed?", options: JSON.stringify(["40 km/h", "60 km/h", "80 km/h", "120 km/h"]), correctIndex: 1, explanation: "Average speed is distance divided by time: 120 / 2 = 60 km/h.", difficulty: "Easy", marks: 1, topic: "Quantitative Aptitude" },
        { text: "If 3 workers finish a task in 12 days, how many days would 6 workers need at the same rate?", options: JSON.stringify(["2", "4", "6", "24"]), correctIndex: 2, explanation: "Doubling the workers halves the time, so 6 days are needed.", difficulty: "Medium", marks: 1, topic: "Time & Work" },
        { text: "Find the next number in the sequence: 2, 4, 8, 16, ?", options: JSON.stringify(["20", "24", "32", "36"]), correctIndex: 2, explanation: "Each number is multiplied by 2.", difficulty: "Easy", marks: 1, topic: "Number Series" },
        { text: "If all developers are problem solvers and Maya is a developer, what follows?", options: JSON.stringify(["Maya is a problem solver", "Maya is a manager", "All problem solvers are developers", "Nothing follows"]), correctIndex: 0, explanation: "Maya belongs to the developer group, which is contained in the problem solver group.", difficulty: "Easy", marks: 1, topic: "Logical Reasoning" },
        { text: "A product priced at 800 is discounted by 25%. What is the sale price?", options: JSON.stringify(["500", "600", "650", "775"]), correctIndex: 1, explanation: "A 25% discount leaves 75% of 800, which is 600.", difficulty: "Easy", marks: 1, topic: "Percentages" }
      ]
    },
    {
      title: "Job Skills & Employability Assessment",
      education: "All Streams",
      course: "Job Skills",
      semester: "Placement Prep",
      subject: "Workplace Readiness",
      questions: [
        { text: "Which resume practice makes experience easiest for a recruiter to scan?", options: JSON.stringify(["Long paragraphs", "Action verbs with measurable results", "Unrelated hobbies first", "No project details"]), correctIndex: 1, explanation: "Action verbs and measurable outcomes make impact clear and scannable.", difficulty: "Easy", marks: 1, topic: "Resume Skills" },
        { text: "What is the best response when you do not know an interview answer?", options: JSON.stringify(["Invent a fact", "Ignore the question", "Explain what you know and describe how you would find the answer", "Leave the interview"]), correctIndex: 2, explanation: "Honesty combined with a sound learning approach demonstrates judgment.", difficulty: "Easy", marks: 1, topic: "Interview Skills" },
        { text: "Which communication habit is most effective in a team discussion?", options: JSON.stringify(["Interrupting often", "Listening and summarizing agreed actions", "Avoiding questions", "Using unexplained jargon"]), correctIndex: 1, explanation: "Active listening and clear actions reduce misunderstandings.", difficulty: "Easy", marks: 1, topic: "Communication" },
        { text: "What should a professional email subject line contain?", options: JSON.stringify(["A clear purpose", "Only emojis", "A blank value", "The entire email body"]), correctIndex: 0, explanation: "A concise subject line tells the recipient why the message matters.", difficulty: "Easy", marks: 1, topic: "Professional Communication" },
        { text: "How should a candidate prepare for a role-specific interview?", options: JSON.stringify(["Study only the company logo", "Review the job requirements and practise relevant examples", "Avoid reading the description", "Memorize unrelated facts"]), correctIndex: 1, explanation: "Preparation should connect the job requirements to evidence from your experience.", difficulty: "Medium", marks: 1, topic: "Career Preparation" }
      ]
    },
    {
      title: "Java Programming & Spring Boot Skills",
      education: "CSE / IT / MCA",
      course: "Job Skills",
      semester: "Sem 4-6",
      subject: "Java & Backend Development",
      questions: [
        { text: "Which keyword prevents a Java method from being overridden?", options: JSON.stringify(["static", "final", "private", "sealed"]), correctIndex: 1, explanation: "A final method cannot be overridden by a subclass.", difficulty: "Easy", marks: 1, topic: "Java OOP" },
        { text: "Which Spring annotation marks a class as a REST controller?", options: JSON.stringify(["@Entity", "@Service", "@RestController", "@Repository"]), correctIndex: 2, explanation: "@RestController combines controller behavior with response-body serialization.", difficulty: "Easy", marks: 1, topic: "Spring Boot" },
        { text: "Which collection does not allow duplicate elements?", options: JSON.stringify(["List", "Queue", "Set", "ArrayList"]), correctIndex: 2, explanation: "The Set contract stores unique elements.", difficulty: "Easy", marks: 1, topic: "Java Collections" },
        { text: "What does ACID isolation protect in a database transaction?", options: JSON.stringify(["Concurrent transactions interfering with each other", "Password length", "Network bandwidth", "Source code formatting"]), correctIndex: 0, explanation: "Isolation controls how concurrent transactions observe one another.", difficulty: "Medium", marks: 1, topic: "Backend Databases" },
        { text: "Which HTTP method is normally used to partially update a resource?", options: JSON.stringify(["GET", "POST", "PATCH", "HEAD"]), correctIndex: 2, explanation: "PATCH applies a partial modification to a resource.", difficulty: "Easy", marks: 1, topic: "REST APIs" }
      ]
    },
    {
      title: "Data Analytics with Excel, Python & Power BI",
      education: "CSE / IT / ECE / MBA",
      course: "Technical Skills",
      semester: "Sem 3-6",
      subject: "Data Analytics",
      questions: [
        { text: "Which pandas structure is two-dimensional and labelled by rows and columns?", options: JSON.stringify(["Series", "DataFrame", "Tuple", "Set"]), correctIndex: 1, explanation: "A pandas DataFrame represents tabular, two-dimensional data.", difficulty: "Easy", marks: 1, topic: "Python Analytics" },
        { text: "Which chart best shows a trend over time?", options: JSON.stringify(["Line chart", "Pie chart", "Scatter-free table", "Icon only"]), correctIndex: 0, explanation: "Line charts make changes across an ordered time axis easy to see.", difficulty: "Easy", marks: 1, topic: "Data Visualization" },
        { text: "What does a SQL GROUP BY clause do?", options: JSON.stringify(["Groups rows for aggregate calculations", "Deletes duplicate tables", "Encrypts columns", "Creates a user account"]), correctIndex: 0, explanation: "GROUP BY forms groups that aggregate functions can summarize.", difficulty: "Easy", marks: 1, topic: "SQL Analytics" },
        { text: "Which measure is least affected by an extreme outlier?", options: JSON.stringify(["Mean", "Median", "Range", "Variance"]), correctIndex: 1, explanation: "The median depends on the middle position rather than the magnitude of extremes.", difficulty: "Medium", marks: 1, topic: "Statistics" },
        { text: "What is the purpose of a dashboard filter?", options: JSON.stringify(["Narrow the displayed data interactively", "Delete the source data", "Change a password", "Compile Python"]), correctIndex: 0, explanation: "Filters let users focus a dashboard on selected dimensions or values.", difficulty: "Easy", marks: 1, topic: "Power BI" }
      ]
    },
    {
      title: "Embedded Systems & IoT Engineering",
      education: "ECE / EEE / EIE",
      course: "Technical Skills",
      semester: "Sem 4-8",
      subject: "Embedded Systems & IoT",
      questions: [
        { text: "Which protocol is commonly used for lightweight IoT publish/subscribe messaging?", options: JSON.stringify(["FTP", "MQTT", "SMTP", "POP3"]), correctIndex: 1, explanation: "MQTT is designed for lightweight publish/subscribe communication.", difficulty: "Easy", marks: 1, topic: "IoT Protocols" },
        { text: "What does ADC convert in a microcontroller?", options: JSON.stringify(["Analog signal to digital value", "Digital value to password", "Code to image", "HTTP to HTML"]), correctIndex: 0, explanation: "An analog-to-digital converter samples voltage and produces a digital representation.", difficulty: "Easy", marks: 1, topic: "Microcontrollers" },
        { text: "Which bus commonly uses SDA and SCL lines?", options: JSON.stringify(["I2C", "USB", "Ethernet", "CAN only"]), correctIndex: 0, explanation: "I2C uses serial data (SDA) and serial clock (SCL).", difficulty: "Easy", marks: 1, topic: "Embedded Interfaces" },
        { text: "Why is a watchdog timer used?", options: JSON.stringify(["To reset a stalled system", "To increase screen brightness", "To store images", "To compress CSS"]), correctIndex: 0, explanation: "A watchdog resets the controller if software fails to service it within a defined period.", difficulty: "Medium", marks: 1, topic: "Embedded Reliability" },
        { text: "Which sensor measures temperature?", options: JSON.stringify(["Thermistor", "LDR only", "Relay", "Antenna"]), correctIndex: 0, explanation: "A thermistor changes resistance with temperature and can be used for measurement.", difficulty: "Easy", marks: 1, topic: "Sensors" }
      ]
    },
    {
      title: "Flutter & Mobile Application Development",
      education: "CSE / IT / Mobile Development",
      course: "Mobile & UI/UX",
      semester: "Sem 4-8",
      subject: "Flutter & Dart",
      questions: [
        { text: "Which language is used to build Flutter applications?", options: JSON.stringify(["Dart", "Kotlin only", "Swift only", "Ruby"]), correctIndex: 0, explanation: "Flutter applications are primarily written in Dart.", difficulty: "Easy", marks: 1, topic: "Dart Fundamentals" },
        { text: "What is a Flutter widget?", options: JSON.stringify(["A building block of the user interface", "A database server", "A compiler error", "A network cable"]), correctIndex: 0, explanation: "Flutter composes interfaces from widgets that describe their appearance and behavior.", difficulty: "Easy", marks: 1, topic: "Flutter UI" },
        { text: "Which widget does not change after it is built?", options: JSON.stringify(["StatefulWidget", "StatelessWidget", "StreamBuilder", "FutureBuilder"]), correctIndex: 1, explanation: "StatelessWidget describes UI without mutable local state.", difficulty: "Easy", marks: 1, topic: "Flutter State" },
        { text: "What does responsive design aim to provide?", options: JSON.stringify(["Usable layouts across screen sizes", "One fixed pixel size", "No touch input", "Only desktop support"]), correctIndex: 0, explanation: "Responsive layouts adapt to different devices and available space.", difficulty: "Easy", marks: 1, topic: "Mobile UX" },
        { text: "Which storage is suitable for small local key-value settings?", options: JSON.stringify(["SharedPreferences", "GPU shader", "HTTP header", "CSS selector"]), correctIndex: 0, explanation: "SharedPreferences stores small persistent key-value preferences locally.", difficulty: "Medium", marks: 1, topic: "Mobile Storage" }
      ]
    },
    {
      title: "Coding Languages & Programming Fundamentals",
      education: "CSE / IT / MCA / All Coding Branches",
      course: "Coding Languages",
      semester: "Sem 1-8",
      subject: "C, C++, Java, Python, JavaScript & Go",
      questions: [
        { text: "Which data type stores true or false values in most programming languages?", options: JSON.stringify(["Boolean", "String", "Float", "Character"]), correctIndex: 0, explanation: "Boolean values represent true or false states.", difficulty: "Easy", marks: 1, topic: "Programming Basics" },
        { text: "Which loop is best when the number of iterations is known in advance?", options: JSON.stringify(["for loop", "Only recursion", "Exception handler", "Import statement"]), correctIndex: 0, explanation: "A for loop clearly expresses iteration over a known range or collection.", difficulty: "Easy", marks: 1, topic: "Control Flow" },
        { text: "Which concept allows one interface to have multiple implementations?", options: JSON.stringify(["Polymorphism", "Compilation", "Serialization", "Indexing"]), correctIndex: 0, explanation: "Polymorphism lets the same interface represent different concrete behaviors.", difficulty: "Medium", marks: 1, topic: "Object-Oriented Programming" },
        { text: "What is the purpose of a function?", options: JSON.stringify(["Reuse a named block of logic", "Delete the operating system", "Only format text", "Increase hardware voltage"]), correctIndex: 0, explanation: "Functions package reusable logic behind a clear input and output contract.", difficulty: "Easy", marks: 1, topic: "Functions" },
        { text: "Which structure follows last-in, first-out order?", options: JSON.stringify(["Queue", "Stack", "Graph", "Table"]), correctIndex: 1, explanation: "A stack removes the most recently added item first.", difficulty: "Easy", marks: 1, topic: "Data Structures" }
      ]
    },
    {
      title: "Non-IT Professional & Practical Skills",
      education: "Mechanical / Electrical / Civil / Commerce / Arts / All Branches",
      course: "Non-IT Skills",
      semester: "All Semesters",
      subject: "Business, Safety, Communication & Operations",
      questions: [
        { text: "What is the first step when planning a practical project?", options: JSON.stringify(["Define the objective and requirements", "Buy random materials", "Skip safety checks", "Submit without testing"]), correctIndex: 0, explanation: "Clear objectives and requirements guide scope, resources, and success criteria.", difficulty: "Easy", marks: 1, topic: "Project Planning" },
        { text: "Which document records workplace hazards and controls?", options: JSON.stringify(["Risk assessment", "Attendance selfie", "Shopping list", "Email signature"]), correctIndex: 0, explanation: "A risk assessment identifies hazards, likelihood, impact, and controls.", difficulty: "Easy", marks: 1, topic: "Workplace Safety" },
        { text: "What does a budget compare?", options: JSON.stringify(["Expected income and expenses", "Only employee names", "Weather and traffic", "Computer screen sizes"]), correctIndex: 0, explanation: "A budget plans expected money coming in and going out.", difficulty: "Easy", marks: 1, topic: "Finance Basics" },
        { text: "Which practice improves customer communication?", options: JSON.stringify(["Listen carefully and confirm the requirement", "Interrupt immediately", "Promise impossible results", "Avoid documenting decisions"]), correctIndex: 0, explanation: "Active listening and confirmation reduce misunderstandings.", difficulty: "Easy", marks: 1, topic: "Communication" },
        { text: "Why are standard operating procedures useful?", options: JSON.stringify(["They make repeatable work safer and more consistent", "They remove all responsibility", "They prevent any improvement", "They replace every training need"]), correctIndex: 0, explanation: "SOPs establish consistent steps, quality checks, and safety expectations.", difficulty: "Medium", marks: 1, topic: "Operations" }
      ]
    },
    {
      title: "Civil Engineering Design & Site Practice",
      education: "Civil Engineering / Architecture / Construction",
      course: "Civil Engineering",
      semester: "Sem 3-8",
      subject: "Surveying, Structures, Materials & Construction",
      questions: [
        { text: "Which instrument is commonly used to measure horizontal and vertical angles in surveying?", options: JSON.stringify(["Theodolite", "Thermometer", "Ammeter", "Microscope"]), correctIndex: 0, explanation: "A theodolite measures horizontal and vertical angles accurately.", difficulty: "Easy", marks: 1, topic: "Surveying" },
        { text: "What is the main purpose of reinforcement in reinforced concrete?", options: JSON.stringify(["Carry tensile stresses", "Make concrete magnetic", "Reduce all dead load to zero", "Replace curing"]), correctIndex: 0, explanation: "Steel reinforcement provides tensile capacity while concrete handles compression well.", difficulty: "Easy", marks: 1, topic: "Structural Design" },
        { text: "Why is concrete curing important?", options: JSON.stringify(["It supports hydration and strength development", "It removes all aggregate", "It paints the surface", "It changes concrete into steel"]), correctIndex: 0, explanation: "Moist curing supports cement hydration and improves strength and durability.", difficulty: "Easy", marks: 1, topic: "Concrete Technology" },
        { text: "What does a project schedule show?", options: JSON.stringify(["Activities, durations, and dependencies", "Only the site address", "Concrete color", "Employee passwords"]), correctIndex: 0, explanation: "Schedules coordinate activities, durations, sequence, and milestones.", difficulty: "Easy", marks: 1, topic: "Construction Management" },
        { text: "Which soil property describes resistance to shearing?", options: JSON.stringify(["Shear strength", "Color index", "Water temperature", "Sound level"]), correctIndex: 0, explanation: "Shear strength is the soil's resistance to sliding or shearing failure.", difficulty: "Medium", marks: 1, topic: "Geotechnical Engineering" }
      ]
    },
    {
      title: "Business Administration & Entrepreneurship Skills",
      education: "BBA / MBA / Commerce / All Branches",
      course: "Non-IT Skills",
      semester: "All Semesters",
      subject: "Business Planning & Entrepreneurship",
      questions: [
        { text: "What is the purpose of a business plan?", options: JSON.stringify(["Define goals, customers, resources, and finances", "Only design a logo", "Avoid measuring results", "Replace every employee"]), correctIndex: 0, explanation: "A business plan gives a venture a structured direction and operating assumptions.", difficulty: "Easy", marks: 1, topic: "Business Planning" },
        { text: "What does customer segmentation do?", options: JSON.stringify(["Groups customers with similar needs", "Deletes customer records", "Sets employee passwords", "Measures rainfall"]), correctIndex: 0, explanation: "Segmentation helps organizations tailor products and communication to distinct groups.", difficulty: "Easy", marks: 1, topic: "Marketing" },
        { text: "What is cash flow?", options: JSON.stringify(["Money entering and leaving a business", "The number of office chairs", "A legal trademark", "A software framework"]), correctIndex: 0, explanation: "Cash flow tracks the movement of money into and out of an organization.", difficulty: "Easy", marks: 1, topic: "Finance" },
        { text: "Which approach best validates a new product idea?", options: JSON.stringify(["Test it with target customers and measure feedback", "Build everything without research", "Ignore complaints", "Copy a random product"]), correctIndex: 0, explanation: "Customer validation reduces uncertainty before committing significant resources.", difficulty: "Medium", marks: 1, topic: "Entrepreneurship" },
        { text: "Why are meeting action items useful?", options: JSON.stringify(["They assign clear owners and deadlines", "They remove accountability", "They replace the agenda", "They hide decisions"]), correctIndex: 0, explanation: "Action items turn discussion into accountable, trackable work.", difficulty: "Easy", marks: 1, topic: "Management" }
      ]
    },
    {
      title: "Healthcare Administration & Patient Service",
      education: "B.Sc Nursing / Pharmacy / Healthcare Management / All Branches",
      course: "Non-IT Skills",
      semester: "All Semesters",
      subject: "Healthcare Operations & Ethics",
      questions: [
        { text: "Why is patient information confidentiality important?", options: JSON.stringify(["It protects privacy and builds trust", "It makes records public", "It removes consent", "It replaces clinical judgment"]), correctIndex: 0, explanation: "Confidential handling protects patients and supports ethical care.", difficulty: "Easy", marks: 1, topic: "Healthcare Ethics" },
        { text: "What is the first priority during a workplace medical emergency?", options: JSON.stringify(["Ensure immediate safety and call the appropriate emergency support", "Take photographs", "Move every patient without assessment", "Ignore the situation"]), correctIndex: 0, explanation: "Safety and prompt escalation are essential during emergencies.", difficulty: "Easy", marks: 1, topic: "Patient Safety" },
        { text: "What does accurate record keeping support?", options: JSON.stringify(["Continuity, safety, and accountability of care", "Less communication", "Unverified billing", "Deleting history"]), correctIndex: 0, explanation: "Accurate records help teams coordinate care and maintain accountability.", difficulty: "Medium", marks: 1, topic: "Documentation" },
        { text: "Which communication practice supports informed consent?", options: JSON.stringify(["Explain relevant information clearly and check understanding", "Use unexplained jargon", "Pressure the patient", "Hide alternatives"]), correctIndex: 0, explanation: "Consent requires understandable information and voluntary understanding.", difficulty: "Easy", marks: 1, topic: "Patient Communication" },
        { text: "Why are hand hygiene procedures important?", options: JSON.stringify(["They reduce the spread of infection", "They replace all protective equipment", "They sterilize a building", "They remove the need for cleaning"]), correctIndex: 0, explanation: "Hand hygiene is a foundational infection-prevention measure.", difficulty: "Easy", marks: 1, topic: "Infection Control" }
      ]
    },
    {
      title: "Agriculture, Food Production & Sustainability",
      education: "Agriculture / Food Technology / Environmental Science / All Branches",
      course: "Non-IT Skills",
      semester: "All Semesters",
      subject: "Agriculture & Sustainable Operations",
      questions: [
        { text: "What is crop rotation used for?", options: JSON.stringify(["Improve soil health and reduce recurring pests", "Use the same crop forever", "Increase soil erosion", "Avoid recording yields"]), correctIndex: 0, explanation: "Rotating crops can improve soil nutrients and disrupt pest cycles.", difficulty: "Easy", marks: 1, topic: "Crop Management" },
        { text: "Which irrigation method delivers water close to plant roots?", options: JSON.stringify(["Drip irrigation", "Flooding every road", "Open exhaust", "Dry storage"]), correctIndex: 0, explanation: "Drip irrigation applies water directly near the root zone with lower waste.", difficulty: "Easy", marks: 1, topic: "Water Management" },
        { text: "What does sustainable production aim to balance?", options: JSON.stringify(["Economic output, environmental care, and social responsibility", "Only short-term output", "Waste and pollution", "No planning"]), correctIndex: 0, explanation: "Sustainability balances present production with long-term environmental and social needs.", difficulty: "Medium", marks: 1, topic: "Sustainability" },
        { text: "Why is food cold-chain control important?", options: JSON.stringify(["It helps preserve quality and limit unsafe microbial growth", "It increases spoilage", "It removes labeling", "It replaces inspection"]), correctIndex: 0, explanation: "Temperature control protects food quality and safety during storage and transport.", difficulty: "Easy", marks: 1, topic: "Food Safety" },
        { text: "What is composting?", options: JSON.stringify(["Controlled decomposition of organic material", "Burning all waste", "Mining metal", "Freezing seeds"]), correctIndex: 0, explanation: "Composting turns suitable organic waste into a useful soil amendment.", difficulty: "Easy", marks: 1, topic: "Waste Management" }
      ]
    }
  ];

  const extensionQuestions = [
    ["Which practice most improves the reliability of production code?", ["Skipping tests", "Automated tests and review", "Hardcoding outputs", "Ignoring errors"], 1, "Engineering Practices"],
    ["Which principle helps keep a software module easier to change?", ["High coupling", "Single responsibility", "Global state", "Duplicated logic"], 1, "Software Design"],
    ["What is the safest way to handle untrusted external input?", ["Execute it directly", "Validate and sanitize it", "Store it in logs only", "Ignore its type"], 1, "Quality & Security"],
    ["Which measurement best helps identify a slow operation?", ["A random guess", "A performance profile or trace", "A longer variable name", "A screenshot"], 1, "Performance"],
    ["What should a useful technical error message provide?", ["No context", "Actionable context without secrets", "Passwords", "Unrelated output"], 1, "Observability"]
  ];

  for (const item of assessmentsData) {
    const questions = [...item.questions];
    for (const [text, options, correctIndex, topic] of extensionQuestions) {
      questions.push({
        text: `${text} (${item.subject})`,
        options: JSON.stringify(options),
        correctIndex: Number(correctIndex),
        explanation: `This is a core ${topic} principle applied to ${item.subject}.`,
        difficulty: "Medium",
        marks: 1,
        topic: String(topic)
      });
    }
    while (questions.length < 50) {
      const template = extensionQuestions[questions.length % extensionQuestions.length];
      questions.push({
        text: `${String(template[0])} - Practice ${questions.length + 1}`,
        options: JSON.stringify(template[1]),
        correctIndex: Number(template[2]),
        explanation: `Practice question for ${item.subject}. ${String(template[0])}`,
        difficulty: "Medium",
        marks: 1,
        topic: String(template[3])
      });
    }
    await db.assessment.create({
      data: {
        title: item.title,
        education: item.education,
        course: item.course,
        semester: item.semester,
        subject: item.subject,
        questions: {
          create: questions
        }
      }
    });
  }

  console.log(`Created ${assessmentsData.length} comprehensive Assessment Modules with full question banks.`);

  // 4. Create Practical Tasks & Project Modules (10 Unlocked Tasks)
  await db.taskSubmission.deleteMany();
  await db.task.deleteMany();

  const tasksData = [
    {
      title: "Build an Explainable Skill Match Engine in TypeScript",
      slug: "skill-match-engine",
      category: "AI & ML / Backend",
      difficulty: "Medium",
      points: 150,
      estimatedMinutes: 35,
      description: "Implement a deterministic skill matching and gap analysis engine that calculates applicant-job compatibility percentage and highlights missing skills.",
      instructions: `### Objective
Create a function \`calculateSkillMatch(jobSkills: string[], candidateSkills: string[])\` in TypeScript that:
1. Normalizes skill names (trims whitespace, converts to lowercase, handles synonyms like 'js' -> 'javascript', 'py' -> 'python').
2. Computes the match percentage: \`(matchedSkills / totalJobSkills) * 100\`.
3. Returns an object with:
   - \`score\`: rounded percentage (0 - 100)
   - \`matched\`: array of normalized matching skills
   - \`missing\`: array of job required skills the candidate lacks
   - \`recommendation\`: actionable advice based on the gap.`,
      starterCode: `export interface SkillMatchResult {
  score: number;
  matched: string[];
  missing: string[];
  recommendation: string;
}

export function calculateSkillMatch(
  jobSkills: string[],
  candidateSkills: string[]
): SkillMatchResult {
  // Normalize skills and map synonyms
  const normalize = (s: string) => {
    const clean = s.trim().toLowerCase();
    if (clean === "js") return "javascript";
    if (clean === "ts") return "typescript";
    if (clean === "py") return "python";
    return clean;
  };

  const req = jobSkills.map(normalize).filter(Boolean);
  const have = new Set(candidateSkills.map(normalize).filter(Boolean));

  const matched = req.filter(s => have.has(s));
  const missing = req.filter(s => !have.has(s));
  const score = req.length ? Math.round((matched.length / req.length) * 100) : 0;

  let recommendation = "Great profile match for this opportunity!";
  if (score < 50) {
    recommendation = \`Focus on acquiring skills in: \${missing.join(", ")} before applying.\`;
  } else if (score < 80) {
    recommendation = \`Good fit! Highlighting experience in \${missing.join(", ")} will strengthen your candidacy.\`;
  }

  return { score, matched, missing, recommendation };
}`,
      solutionGuide: "Ensure case-insensitivity, set lookups for O(1) membership testing, and handle empty skill sets gracefully.",
      tags: "typescript, algorithms, job-matching, explainable-ai"
    },
    {
      title: "Implement Secure JWT Auth with Token Rotation",
      slug: "jwt-auth-rotation",
      category: "Backend & Security",
      difficulty: "Hard",
      points: 200,
      estimatedMinutes: 45,
      description: "Build a stateful refresh token rotation mechanism with httpOnly cookies that prevents replay attacks and revokes compromised sessions.",
      instructions: `### Objective
Design a secure authentication pipeline:
1. Issue short-lived Access Tokens (15 mins) and cryptographically secure Refresh Tokens (7 days).
2. Store Refresh Token family IDs in the database.
3. On refresh: invalidate the used refresh token and issue a new token pair.
4. If a previously used refresh token is detected (replay attempt): immediately revoke the entire token family!`,
      starterCode: `import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "taskhive-secure-demo-secret-key-2026");

export async function signAccessToken(payload: { userId: string; role: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(SECRET);
}

export async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch {
    return null;
  }
}`,
      solutionGuide: "Use 'jose' for Web Crypto standard compatibility across Next.js Edge and Node.js runtimes.",
      tags: "jwt, security, backend, authentication, jose"
    },
    {
      title: "Design a Responsive Glassmorphic Dashboard Component",
      slug: "glassmorphic-dashboard",
      category: "Frontend & UI/UX",
      difficulty: "Medium",
      points: 120,
      estimatedMinutes: 30,
      description: "Create a modern, accessible glassmorphism statistics card with frosted glass backdrop-filter, border gradients, and hover micro-animations.",
      instructions: `### Objective
Create a responsive CSS/React Card component featuring:
1. \`backdrop-filter: blur(16px)\` with subtle \`rgba(255, 255, 255, 0.05)\` surface.
2. 1px semi-transparent accent borders that glow on hover.
3. Smooth \`transform: translateY(-4px)\` transition with cubic-bezier easing.
4. Metric counter, mini progress bar, and badge indicators.`,
      starterCode: `export function GlassStatCard({
  title,
  value,
  subtitle,
  progress,
  badge
}: {
  title: string;
  value: string | number;
  subtitle: string;
  progress?: number;
  badge?: string;
}) {
  return (
    <div className="glass-card">
      <div className="glass-header">
        <span className="glass-title">{title}</span>
        {badge && <span className="glass-badge">{badge}</span>}
      </div>
      <div className="glass-value">{value}</div>
      <p className="glass-sub">{subtitle}</p>
      {typeof progress === "number" && (
        <div className="glass-progress">
          <div className="glass-fill" style={{ width: \`\${progress}%\` }} />
        </div>
      )}
    </div>
  );
}`,
      solutionGuide: "Use layered linear-gradients with border-radius 16px and subtle drop shadows for high-end aesthetic depth.",
      tags: "react, css, glassmorphism, responsive, ui-design"
    },
    {
      title: "Vector Embeddings Cosine Similarity Search Engine",
      slug: "embeddings-similarity-search",
      category: "AI & ML",
      difficulty: "Hard",
      points: 220,
      estimatedMinutes: 50,
      description: "Implement a high-performance vector search utility that computes dot product and Euclidean norm to find top-K closest document matches.",
      instructions: `### Objective
Write a vector similarity search engine:
1. Compute dot product: \`Σ (A[i] * B[i])\`.
2. Compute vector magnitudes: \`||A|| = sqrt(Σ A[i]²)\`.
3. Compute cosine similarity: \`dotProduct / (||A|| * ||B||)\`.
4. Rank documents and return the top-K highest scoring results with metadata.`,
      starterCode: `export interface VectorDocument {
  id: string;
  title: string;
  embedding: number[];
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dot / denominator;
}

export function searchTopK(
  queryEmbedding: number[],
  documents: VectorDocument[],
  k: number = 3
) {
  return documents
    .map(doc => ({
      ...doc,
      score: Math.round(cosineSimilarity(queryEmbedding, doc.embedding) * 1000) / 1000
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}`,
      solutionGuide: "Optimize inner loop operations and handle zero-vector divide-by-zero edge cases safely.",
      tags: "ai, machine-learning, vector-search, rag, math"
    },
    {
      title: "Optimize Slow SQL Queries with CTEs & Indexed Lookups",
      slug: "sql-query-optimization",
      category: "Data Engineering",
      difficulty: "Easy",
      points: 90,
      estimatedMinutes: 25,
      description: "Refactor a heavy N+1 query pattern into a single optimized CTE query with aggregation and window ranking.",
      instructions: `### Objective
Given student assessment attempts, write a SQL query using CTEs that:
1. Calculates each student's average assessment score.
2. Ranks students within their college branch using \`DENSE_RANK()\`.
3. Filters for students with at least 1 completed assessment.`,
      starterCode: `-- Optimized Student Ranking Query with CTE
WITH StudentStats AS (
  SELECT 
    u.id AS user_id,
    u.name,
    u.branch,
    u.college,
    COUNT(a.id) AS total_attempts,
    ROUND(AVG(a.score), 1) AS avg_score
  FROM User u
  JOIN AssessmentAttempt a ON a.userId = u.id
  WHERE u.role = 'STUDENT'
  GROUP BY u.id, u.name, u.branch, u.college
),
RankedStudents AS (
  SELECT 
    *,
    DENSE_RANK() OVER(PARTITION BY branch ORDER BY avg_score DESC) AS branch_rank
  FROM StudentStats
)
SELECT * FROM RankedStudents
ORDER BY branch, branch_rank;`,
      solutionGuide: "CTEs provide cleaner execution plans and avoid subquery recalculation in window functions.",
      tags: "sql, cte, database, analytics, optimization"
    },
    {
      title: "Implement an O(1) LRU Cache with Doubly Linked List",
      slug: "lru-cache-implementation",
      category: "Data Structures & Algorithms",
      difficulty: "Medium",
      points: 140,
      estimatedMinutes: 35,
      description: "Implement a Least Recently Used (LRU) Cache data structure supporting get(key) and put(key, value) operations in strict O(1) time.",
      instructions: `### Objective
Build an \`LRUCache<K, V>\` class with:
- \`get(key)\`: Returns value if key exists and moves node to head (most recently used). Returns \`undefined\` if not found.
- \`put(key, value)\`: Inserts or updates key. If capacity is exceeded, evicts the least recently used node from tail.
- Time Complexity: O(1) for both get and put.`,
      starterCode: `class DNode<K, V> {
  key: K;
  val: V;
  prev: DNode<K, V> | null = null;
  next: DNode<K, V> | null = null;
  constructor(key: K, val: V) {
    this.key = key;
    this.val = val;
  }
}

export class LRUCache<K, V> {
  private capacity: number;
  private map: Map<K, DNode<K, V>>;
  private head: DNode<K, V>;
  private tail: DNode<K, V>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.map = new Map();
    this.head = new DNode<any, any>(null, null);
    this.tail = new DNode<any, any>(null, null);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  private remove(node: DNode<K, V>) {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }

  private insertToHead(node: DNode<K, V>) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next!.prev = node;
    this.head.next = node;
  }

  get(key: K): V | undefined {
    const node = this.map.get(key);
    if (!node) return undefined;
    this.remove(node);
    this.insertToHead(node);
    return node.val;
  }

  put(key: K, value: V): void {
    if (this.map.has(key)) {
      this.remove(this.map.get(key)!);
    }
    const newNode = new DNode(key, value);
    this.insertToHead(newNode);
    this.map.set(key, newNode);

    if (this.map.size > this.capacity) {
      const lru = this.tail.prev!;
      this.remove(lru);
      this.map.delete(lru.key);
    }
  }
}`,
      solutionGuide: "Dummy head and tail nodes eliminate null pointer checks when inserting or removing from boundaries.",
      tags: "dsa, algorithms, lru-cache, linked-list, hashmap"
    },
    {
      title: "Production Multi-Stage Dockerfile with Healthcheck",
      slug: "multistage-dockerfile",
      category: "DevOps & Cloud",
      difficulty: "Easy",
      points: 100,
      estimatedMinutes: 20,
      description: "Write an optimized, non-root multi-stage Dockerfile for a Next.js standalone application with built-in container healthchecks.",
      instructions: `### Objective
Create a production-grade Dockerfile:
1. Base Stage: Node.js 20 Alpine.
2. Dependencies Stage: install dependencies with cached layer.
3. Builder Stage: run \`npm run build\`.
4. Runner Stage: minimal production image running as non-root \`nextjs\` user with \`HEALTHCHECK\` instruction.`,
      starterCode: `# 1. Base stage
FROM node:20-alpine AS base

# 2. Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# 3. Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 4. Runner (Production)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \\
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]`,
      solutionGuide: "Using Next.js standalone output copies only required node_modules, cutting image size from 1GB to <120MB.",
      tags: "docker, devops, nextjs, containerization, production"
    },
    {
      title: "Interactive MCQ Quiz Engine with Timer & Autosave",
      slug: "mcq-quiz-engine",
      category: "Frontend & State Management",
      difficulty: "Easy",
      points: 110,
      estimatedMinutes: 25,
      description: "Develop a React quiz state machine with local storage autosave, countdown timer, question palette, and instant review mode.",
      instructions: `### Objective
Implement a robust assessment client hook that:
1. Persists answered questions to \`localStorage\` on every choice selection.
2. Tracks time remaining with a 1-second interval; auto-submits when timer reaches 0.
3. Provides navigation between questions with visited / flagged status.`,
      starterCode: `import { useState, useEffect } from "react";

export function useQuizState(quizId: string, totalQuestions: number, durationMinutes: number = 15) {
  const storageKey = \`quiz_answers_\${quizId}\`;
  
  const [answers, setAnswers] = useState<Record<string, number>>(() => {
    if (typeof window === "undefined") return {};
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : {};
  });

  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(answers));
  }, [answers, storageKey]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const selectAnswer = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const clearAutosave = () => {
    localStorage.removeItem(storageKey);
  };

  return { answers, selectAnswer, timeLeft, clearAutosave };
}`,
      solutionGuide: "Using initializer function in useState avoids redundant localStorage reads on re-renders.",
      tags: "react, state-machine, localStorage, hooks, frontend"
    }
  ];

  const coreTasks = [
    {
      title: "Design a Smart Energy Meter with ESP32 and MQTT",
      slug: "smart-energy-meter",
      category: "ECE / EEE Core",
      difficulty: "Medium",
      points: 130,
      estimatedMinutes: 35,
      description: "Build an IoT energy meter that samples voltage and current, calculates power usage, and publishes readings through MQTT.",
      instructions: "### Objective\nDesign a reliable embedded energy-monitoring pipeline:\n1. Sample voltage and current sensors at a fixed interval.\n2. Calculate real power and cumulative energy.\n3. Publish validated readings over MQTT.\n4. Handle disconnected sensors and reconnect safely.",
      starterCode: "// Define sensor sampling, power calculation, and MQTT publishing functions.\nexport function calculatePower(voltage: number, current: number): number {\n  return voltage * current;\n}",
      solutionGuide: "Use calibrated sensor values, consistent sampling intervals, units in every payload, and retry-safe MQTT publishing.",
      tags: "embedded, esp32, mqtt, sensors, eee"
    },
    {
      title: "Implement an FPGA UART Transmitter and Receiver",
      slug: "fpga-uart-communication",
      category: "ECE / EEE Core",
      difficulty: "Hard",
      points: 170,
      estimatedMinutes: 45,
      description: "Create a clocked UART module with configurable baud rate, start and stop bits, and a ready/valid interface for reliable serial communication.",
      instructions: "### Objective\nImplement synthesizable UART TX and RX logic:\n1. Derive baud ticks from the system clock.\n2. Transmit and sample start, data, and stop bits.\n3. Expose busy, valid, and framing-error signals.\n4. Test loopback communication with a self-checking simulation.",
      starterCode: "// Pseudocode for a synthesizable UART state machine.\ntype UartState = \"IDLE\" | \"START\" | \"DATA\" | \"STOP\";\nexport function nextState(state: UartState, tick: boolean): UartState {\n  return state;\n}",
      solutionGuide: "Use explicit FSM states, counter widths derived from parameters, and mid-bit sampling for noise tolerance.",
      tags: "fpga, verilog, uart, digital-design, ece"
    },
    {
      title: "Model and Tune a PID Motor Speed Controller",
      slug: "pid-motor-controller",
      category: "EEE Core / Control Systems",
      difficulty: "Medium",
      points: 145,
      estimatedMinutes: 40,
      description: "Simulate a DC motor and tune a PID controller to reach target speed quickly while minimizing overshoot and steady-state error.",
      instructions: "### Objective\nBuild a discrete-time control simulation:\n1. Model motor speed response.\n2. Calculate proportional, integral, and derivative terms.\n3. Clamp actuator output and prevent integral windup.\n4. Report rise time, overshoot, and settling time.",
      starterCode: "export function pidStep(error: number, integral: number, previousError: number, dt: number) {\n  const kp = 1.2;\n  const ki = 0.4;\n  const kd = 0.08;\n  const nextIntegral = integral + error * dt;\n  return { output: kp * error + ki * nextIntegral + kd * (error - previousError) / dt, integral: nextIntegral };\n}",
      solutionGuide: "Tune gains methodically, clamp output, and protect the integral term when the actuator saturates.",
      tags: "control-systems, pid, motors, matlab, eee"
    },
    {
      title: "Build a Digital Modulation and Signal Recovery Lab",
      slug: "digital-modulation-lab",
      category: "ECE Core / Communication",
      difficulty: "Hard",
      points: 180,
      estimatedMinutes: 50,
      description: "Implement BPSK and QPSK modulation, add configurable noise, and recover the transmitted bits with symbol decisions and BER reporting.",
      instructions: "### Objective\nCreate a communication-system simulation:\n1. Map bits to BPSK and QPSK symbols.\n2. Add controlled Gaussian channel noise.\n3. Demodulate symbols using decision boundaries.\n4. Compare bit error rate across signal-to-noise ratios.",
      starterCode: "export function bpsk(bit: 0 | 1): number {\n  return bit === 0 ? -1 : 1;\n}\n\nexport function demodulate(symbol: number): 0 | 1 {\n  return symbol >= 0 ? 1 : 0;\n}",
      solutionGuide: "Keep mapper and demapper conventions identical, use a seeded noise source for repeatable tests, and calculate BER over enough symbols.",
      tags: "signals, modulation, bpsk, qpsk, communication, ece"
    },
    {
      title: "Analyze a Three-Phase Power Quality Monitor",
      slug: "three-phase-power-monitor",
      category: "EEE Core / Power Systems",
      difficulty: "Easy",
      points: 115,
      estimatedMinutes: 30,
      description: "Process sampled three-phase voltage and current data to calculate RMS values, power factor, imbalance, and anomaly alerts.",
      instructions: "### Objective\nAnalyze a three-phase electrical waveform dataset:\n1. Calculate per-phase RMS voltage and current.\n2. Estimate real, apparent, and reactive power.\n3. Compute power factor and phase imbalance.\n4. Flag values outside configured safety limits.",
      starterCode: "export function rms(samples: number[]): number {\n  if (!samples.length) return 0;\n  return Math.sqrt(samples.reduce((sum, value) => sum + value * value, 0) / samples.length);\n}",
      solutionGuide: "Validate sample windows, preserve sign conventions, and separate measurement anomalies from genuine phase imbalance.",
      tags: "power-systems, rms, power-factor, monitoring, eee"
    }
  ];
  const additionalTasks = [
    {
      title: "Build an Accessible Portfolio Website",
      slug: "accessible-portfolio-website",
      category: "Web / All Branches",
      difficulty: "Easy",
      points: 100,
      estimatedMinutes: 30,
      description: "Create a responsive portfolio with accessible navigation, skills, projects, and contact details.",
      instructions: "Build responsive profile, skills, projects, and contact sections with semantic HTML, keyboard support, validation, and mobile testing.",
      starterCode: "export function validateEmail(email: string): boolean { return /^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(email); }",
      solutionGuide: "Use semantic landmarks, visible focus states, sufficient contrast, and responsive layout constraints.",
      tags: "html, css, javascript, accessibility, portfolio"
    },
    {
      title: "Create a Sales and Expense Analysis Dashboard",
      slug: "sales-expense-dashboard",
      category: "Data / Commerce / Management",
      difficulty: "Medium",
      points: 125,
      estimatedMinutes: 40,
      description: "Turn monthly sales and expense records into a dashboard with totals, trends, comparisons, and recommendations.",
      instructions: "Clean a business dataset, calculate revenue, expenses, profit, monthly change, and category summaries, then present findings clearly.",
      starterCode: "export function profit(revenue: number, expense: number): number { return revenue - expense; }",
      solutionGuide: "Keep calculations separate from presentation, document assumptions, and verify totals with small test datasets.",
      tags: "analytics, excel, python, sql, dashboard, commerce"
    },
    {
      title: "Design a Safe Workshop Maintenance Checklist",
      slug: "workshop-maintenance-checklist",
      category: "Mechanical / Manufacturing",
      difficulty: "Easy",
      points: 110,
      estimatedMinutes: 35,
      description: "Prepare a preventive-maintenance checklist for workshop equipment with inspection frequency, risk level, and owner.",
      instructions: "List equipment and inspection points, assign daily, weekly, and monthly checks, record hazards and PPE, and define escalation steps.",
      starterCode: "export function isOverdue(daysSinceLastCheck: number): boolean { return daysSinceLastCheck > 0; }",
      solutionGuide: "Prioritize safety-critical checks, make responsibilities explicit, and leave an auditable inspection record.",
      tags: "mechanical, manufacturing, maintenance, safety, operations"
    },
    {
      title: "Plan a Solar Backup System Load Schedule",
      slug: "solar-backup-load-schedule",
      category: "EEE / Energy / Electrical",
      difficulty: "Medium",
      points: 135,
      estimatedMinutes: 40,
      description: "Estimate daily loads and design a priority schedule for a solar and battery backup system.",
      instructions: "Calculate watt-hours, separate critical and optional loads, estimate battery and panel capacity, and document safety assumptions.",
      starterCode: "export function energyWh(powerWatts: number, hours: number): number { return powerWatts * hours; }",
      solutionGuide: "Show units in every calculation, include efficiency losses, and include electrical protection considerations.",
      tags: "electrical, solar, energy, circuits, eee, safety"
    },
    {
      title: "Prepare a Small Building Quantity Estimate",
      slug: "building-quantity-estimate",
      category: "Civil / Construction",
      difficulty: "Medium",
      points: 140,
      estimatedMinutes: 45,
      description: "Prepare a quantity estimate for basic masonry and concrete work from building dimensions and assumptions.",
      instructions: "Calculate wall, floor, and concrete volumes, deduct openings, list wastage assumptions, and map quantities to materials and units.",
      starterCode: "export function rectangularVolume(length: number, width: number, height: number): number { return length * width * height; }",
      solutionGuide: "Keep dimensions and units consistent, state deductions clearly, and separate measured quantities from procurement allowances.",
      tags: "civil, estimation, quantity-surveying, construction, concrete"
    }
  ];
  const tasksToSeed = [...tasksData.slice(0, 5), ...coreTasks, ...additionalTasks];

  for (const t of tasksToSeed) {
    await db.task.create({
      data: t
    });
  }

  console.log(`Created ${tasksToSeed.length} practical coding tasks and projects.`);

  // 5. Seed Top Job Opportunities
  await db.application.deleteMany();
  await db.savedJob.deleteMany();
  await db.job.deleteMany();

  const jobsData = [
    {
      recruiterId: rec1.id,
      title: "Junior AI & ML Engineer",
      description: "Build cutting-edge generative AI models, vector retrieval pipelines, and evaluation benchmarks for next-generation developer tooling.",
      type: "Full-time",
      location: "Remote / Bengaluru",
      deadline: new Date("2026-11-30"),
      qualifications: "B.Tech/B.E. in AI, DS, CS or equivalent. Strong proficiency in Python, PyTorch, and Transformer architectures.",
      requiredSkills: "Python, Machine Learning, SQL, PyTorch",
      preferredSkills: "Generative AI, LangChain, Vector Databases, FastApi",
      vacancies: 2
    },
    {
      recruiterId: rec1.id,
      title: "Frontend Developer Intern (React/Next.js)",
      description: "Craft pixel-perfect, accessible user interfaces with Next.js App Router, React 19, and modern CSS glassmorphic design systems.",
      type: "Internship",
      location: "Bengaluru / Hybrid",
      deadline: new Date("2026-10-15"),
      qualifications: "Pre-final or final year engineering students with a strong portfolio of modern React or Next.js web applications.",
      requiredSkills: "JavaScript, React, TypeScript, HTML, CSS",
      preferredSkills: "Next.js, TailwindCSS, State Management, UI/UX",
      vacancies: 3
    },
    {
      recruiterId: rec2.id,
      title: "Cloud & Backend Systems Engineer",
      description: "Architect high-throughput microservices, distributed caching layers with Redis, and automated Docker/Kubernetes CI/CD pipelines.",
      type: "Full-time",
      location: "Bengaluru / Hybrid",
      deadline: new Date("2026-12-15"),
      qualifications: "Graduate in Computer Science or Information Technology with hands-on experience in Node.js, Go, or Python backend services.",
      requiredSkills: "Node.js, SQL, Docker, TypeScript",
      preferredSkills: "Kubernetes, Redis, PostgreSQL, AWS",
      vacancies: 2
    },
    {
      recruiterId: rec2.id,
      title: "Data Science & Analytics Intern",
      description: "Analyze user performance data, build predictive student career fit models, and develop interactive business intelligence dashboards.",
      type: "Internship",
      location: "Mumbai / Hybrid",
      deadline: new Date("2026-10-31"),
      qualifications: "Strong analytical mindset, solid foundation in statistics, SQL queries, Python data analysis (Pandas, Scikit-learn).",
      requiredSkills: "Python, SQL, Data Structures",
      preferredSkills: "Pandas, PowerBI, Tableau, Statistics",
      vacancies: 4
    },
    {
      recruiterId: rec1.id,
      title: "Full-Stack Product Engineer",
      description: "Lead end-to-end feature delivery from database schema design with Prisma ORM to rich responsive client components and edge API routes.",
      type: "Full-time",
      location: "Remote",
      deadline: new Date("2026-11-20"),
      qualifications: "B.Tech/B.E. graduate with demonstrable full-stack web project portfolio.",
      requiredSkills: "React, Next.js, TypeScript, SQL, Node.js",
      preferredSkills: "Prisma, REST APIs, TailwindCSS, Jest",
      vacancies: 2
    },
    {
      recruiterId: rec2.id,
      title: "Cybersecurity & AppSec Associate",
      description: "Perform web application vulnerability scans, audit authentication mechanisms (OAuth2/JWT), and enforce OWASP secure coding guidelines.",
      type: "Full-time",
      location: "Pune / Hybrid",
      deadline: new Date("2026-12-05"),
      qualifications: "Degree in Cybersecurity, Computer Science or equivalent certifications (Security+, CEH).",
      requiredSkills: "Web Security, Python, Networking",
      preferredSkills: "OWASP Top 10, Penetration Testing, Cryptography",
      vacancies: 1
    },
    {
      recruiterId: rec1.id,
      title: "Embedded Systems Engineer",
      description: "Develop firmware, sensor integrations, and hardware validation tools for connected industrial devices.",
      type: "Full-time",
      location: "Chennai / On-site",
      deadline: new Date("2026-12-20"),
      qualifications: "B.E./B.Tech in ECE, EEE, Instrumentation, or related engineering discipline with embedded C experience.",
      requiredSkills: "Embedded C, Microcontrollers, UART, Digital Electronics",
      preferredSkills: "FreeRTOS, SPI, I2C, PCB Debugging",
      vacancies: 2
    },
    {
      recruiterId: rec2.id,
      title: "Power Electronics Design Intern",
      description: "Support the design, simulation, and testing of power-conversion circuits for energy-efficient products.",
      type: "Internship",
      location: "Hyderabad / Hybrid",
      deadline: new Date("2026-11-10"),
      qualifications: "Pre-final or final year EEE/ECE student familiar with circuit analysis, control systems, and lab measurement.",
      requiredSkills: "Power Electronics, Circuit Analysis, Control Systems",
      preferredSkills: "MATLAB, Simulink, PCB Design, Motor Control",
      vacancies: 3
    }
  ];

  for (const j of jobsData) {
    await db.job.create({
      data: j
    });
  }

  console.log(`Created ${jobsData.length} active job listings from top companies.`);

  // 6. Seed Demo Attempts, Task Submissions, and Certificates for Students
  const allAssessments = await db.assessment.findMany();
  const allTasks = await db.task.findMany();
  const allJobs = await db.job.findMany();

  // Aarav's attempts & completed tasks
  if (allAssessments.length > 0) {
    // 100% attempt on Python -> Certificate Unlocked!
    const att1 = await db.assessmentAttempt.create({
      data: {
        userId: s1.id,
        assessmentId: allAssessments[0].id,
        answers: JSON.stringify({}),
        score: 100,
        total: 50,
        skillLevel: "Advanced",
        strengths: "Functions & Lambdas, List Comprehensions, OOP, Exception Handling, Data Structures",
        weaknesses: "No major weak topic detected.",
        recommendations: "Outstanding mastery! Ready for senior engineering challenges and real-world system design."
      }
    });

    await db.certificate.create({
      data: {
        userId: s1.id,
        attemptId: att1.id,
        certificateNo: "TH-2026-PY-ADV982",
        score: 100,
        skillLevel: "Advanced"
      }
    });

    // 85% attempt on ML
    if (allAssessments.length > 1) {
      const att2 = await db.assessmentAttempt.create({
        data: {
          userId: s1.id,
          assessmentId: allAssessments[1].id,
          answers: JSON.stringify({}),
          score: 85,
          total: 50,
          skillLevel: "Advanced",
          strengths: "Transformers & Attention, LLMs & Prompt Engineering, RAG",
          weaknesses: "Neural Network Regularization",
          recommendations: "Deepen understanding of advanced dropout schedules and learning rate decay."
        }
      });

      await db.certificate.create({
        data: {
          userId: s1.id,
          attemptId: att2.id,
          certificateNo: "TH-2026-AI-TOP771",
          score: 85,
          skillLevel: "Advanced"
        }
      });
    }
  }

  // Priya's attempts
  if (allAssessments.length > 2) {
    await db.assessmentAttempt.create({
      data: {
        userId: s2.id,
        assessmentId: allAssessments[2].id, // Frontend
        answers: JSON.stringify({}),
        score: 90,
        total: 50,
        skillLevel: "Advanced",
        strengths: "Next.js Architecture, React Hooks, Virtual DOM",
        weaknesses: "Modern CSS :has() selectors",
        recommendations: "Exceptional frontend capability. Continue exploring full-stack data fetching."
      }
    });
  }

  // Rohan's attempts
  if (allAssessments.length > 3) {
    await db.assessmentAttempt.create({
      data: {
        userId: s3.id,
        assessmentId: allAssessments[3].id, // Backend
        answers: JSON.stringify({}),
        score: 95,
        total: 50,
        skillLevel: "Advanced",
        strengths: "RESTful API Standards, Node.js Event Loop, Auth Security, Caching",
        weaknesses: "None",
        recommendations: "Ready for high-scale distributed backend systems."
      }
    });
  }

  // Seed Completed Practical Task Submissions
  if (allTasks.length > 0) {
    await db.taskSubmission.create({
      data: {
        userId: s1.id,
        taskId: allTasks[0].id,
        status: "COMPLETED",
        code: allTasks[0].starterCode || "",
        score: 150,
        notes: "Passed all test cases including synonym normalization and empty set checks.",
        feedback: "Clean TypeScript implementation with optimal O(N) lookup time."
      }
    });

    if (allTasks.length > 3) {
      await db.taskSubmission.create({
        data: {
          userId: s1.id,
          taskId: allTasks[3].id,
          status: "COMPLETED",
          code: allTasks[3].starterCode || "",
          score: 220,
          notes: "Implemented dot product and cosine normalization with float rounding.",
          feedback: "Accurate vector search calculations with top-K ranking."
        }
      });
    }
  }

  // Seed sample applications
  if (allJobs.length >= 2) {
    await db.application.create({
      data: {
        userId: s1.id,
        jobId: allJobs[0].id, // Junior AI Engineer
        status: "SHORTLISTED",
        note: "Top assessment score in Python and ML tracks."
      }
    });

    await db.application.create({
      data: {
        userId: s1.id,
        jobId: allJobs[1].id, // Frontend Intern
        status: "INTERVIEW_SCHEDULED",
        note: "Interview scheduled for upcoming Thursday."
      }
    });

    await db.application.create({
      data: {
        userId: s2.id,
        jobId: allJobs[1].id,
        status: "UNDER_REVIEW",
        note: "Portfolio review in progress."
      }
    });

    await db.application.create({
      data: {
        userId: s3.id,
        jobId: allJobs[2].id, // Cloud Engineer
        status: "SELECTED",
        note: "Offer letter generated."
      }
    });
  }

  console.log(`✅ HireLytix seed successfully completed with ${allAssessments.length} modules, ${allJobs.length} jobs, and ${allTasks.length} practical tasks unlocked!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
