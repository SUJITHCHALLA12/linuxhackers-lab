(function () {
  "use strict";

  const INSTAGRAM_URL = "https://www.instagram.com/linux_hackers?igsh=cnU0dTc1YmJlYTQ4";
  const INSTAGRAM_HANDLE = "@linux_hackers";

  function updateExistingInstagramPopup(root) {
    const scope = root || document;
    scope.querySelectorAll("a[href*='instagram.com']").forEach((link) => {
      if (link.href.includes("gokali_ai")) {
        link.href = INSTAGRAM_URL;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
      if ((link.textContent || "").includes("@gokali_ai")) {
        link.textContent = INSTAGRAM_HANDLE;
      }
    });

    scope.querySelectorAll("*").forEach((node) => {
      if (node.childNodes.length === 1 && node.firstChild && node.firstChild.nodeType === Node.TEXT_NODE) {
        node.textContent = node.textContent
          .replace(/GO KALI/g, "Linux-Hackers")
          .replace(/@gokali_ai/g, INSTAGRAM_HANDLE)
          .replace(/gokali_ai/g, "linux_hackers");
      }
    });

    enhanceExistingInstagramActions(scope);
  }

  function closeDialogFromButton(button) {
    const dialog = button.closest("[role='dialog']");
    const closeButton =
      dialog &&
      Array.from(dialog.querySelectorAll("button")).find((candidate) => {
        const text = (candidate.textContent || "").trim().toLowerCase();
        const label = (candidate.getAttribute("aria-label") || "").trim().toLowerCase();
        return candidate !== button && (text === "x" || text === "×" || label === "close");
      });

    if (closeButton) {
      closeButton.click();
      return;
    }

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true }));

    window.setTimeout(() => {
      if (!dialog || !document.body.contains(dialog)) return;
      const portal = dialog.closest("[data-radix-portal]");
      if (portal) {
        portal.remove();
        return;
      }

      const fixedParent = dialog.parentElement && getComputedStyle(dialog.parentElement).position === "fixed" ? dialog.parentElement : null;
      if (fixedParent) fixedParent.remove();
      else dialog.hidden = true;
    }, 50);
  }

  function enhanceExistingInstagramActions(root) {
    const dialogs = Array.from(document.querySelectorAll("[role='dialog']"));
    dialogs.forEach((dialog) => {
      if (!/instagram|linux_hackers|gokali_ai/i.test(dialog.textContent || "")) return;
      if (dialog.dataset.lhInstagramEnhanced === "true") return;

      dialog.dataset.lhInstagramEnhanced = "true";
      dialog.querySelectorAll("a[href*='instagram.com']").forEach((link) => {
        link.href = INSTAGRAM_URL;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        if (/follow/i.test(link.textContent || "")) {
          link.textContent = `Follow ${INSTAGRAM_HANDLE}`;
        }
      });

      const actions = document.createElement("div");
      actions.className = "lh-existing-follow-actions";
      actions.innerHTML = `
        <a class="lh-existing-follow-primary" href="${INSTAGRAM_URL}" target="_blank" rel="noopener noreferrer">Follow ${INSTAGRAM_HANDLE}</a>
        <button class="lh-existing-follow-secondary" type="button">Continue to website</button>
      `;

      const existingFollowButton = Array.from(dialog.querySelectorAll("a[href*='instagram.com']")).find((link) =>
        /follow/i.test(link.textContent || "")
      );
      if (existingFollowButton) {
        existingFollowButton.replaceWith(actions);
      } else {
        dialog.appendChild(actions);
      }

      actions.querySelector(".lh-existing-follow-secondary").addEventListener("click", (event) => {
        event.preventDefault();
        closeDialogFromButton(event.currentTarget);
      });
    });
  }

  const fakeFiles = {
    "/": ["home", "etc", "var"],
    "/home": ["student"],
    "/home/student": ["Desktop", "Documents", "Downloads", "wordlists", "labs", "notes.txt"],
    "/home/student/wordlists": ["rockyou.txt", "common.txt", "demo-users.txt"],
    "/home/student/Documents": ["lab1.md", "lab2.md", "commands.md"],
    "/home/student/labs": ["nmap-basics.md", "web-checklist.md", "linux-practice.md"],
    "/etc": ["passwd", "hosts", "resolv.conf"],
    "/var/log": ["auth.log", "syslog"],
    "/var": ["log"],
  };

  const fakeFileContents = {
    "/home/student/notes.txt": "Practice only on systems you own or have written permission to test.",
    "/home/student/wordlists/rockyou.txt": "[demo] 14,344,391 entries - file not actually loaded in sandbox.",
    "/home/student/wordlists/common.txt": "admin\npassword\npassword123\nroot\nstudent",
    "/home/student/wordlists/demo-users.txt": "admin\nstudent\ntester",
    "/home/student/Documents/lab1.md": "# Lab 1\nPractice navigation with pwd, ls, cd, mkdir, touch, cat, rm.",
    "/home/student/Documents/lab2.md": "# Lab 2\nPractice safe nmap and web-tool simulations.",
    "/home/student/Documents/commands.md": "Useful commands: ls, cd, cat, find, grep, mkdir, touch, rm, cp, mv.",
    "/home/student/labs/nmap-basics.md": "Use nmap only against systems you own or have permission to test.",
    "/home/student/labs/web-checklist.md": "Check headers, forms, auth flows, and logs in approved lab targets.",
    "/home/student/labs/linux-practice.md": "This browser lab stores changes in memory only for the current session.",
    "/etc/passwd": "root:x:0:0:root:/root:/usr/sbin/nologin\nstudent:x:1000:1000:student:/home/student:/bin/bash",
    "/etc/hosts": "127.0.0.1 localhost\n10.10.10.25 linux-hackers-lab",
    "/etc/resolv.conf": "nameserver 1.1.1.1",
    "/var/log/auth.log": "May 26 10:00:00 sandbox sshd[101]: Accepted publickey for student [simulated]",
    "/var/log/syslog": "May 26 10:00:00 sandbox kernel: practice lab booted [simulated]",
  };

  let cwd = "/home/student";

  function normalizePath(path) {
    const parts = [];
    path.split("/").forEach((part) => {
      if (!part || part === ".") return;
      if (part === "..") parts.pop();
      else parts.push(part);
    });
    return "/" + parts.join("/") || "/";
  }

  function resolvePath(input) {
    if (!input || input === "~") return "/home/student";
    if (input.startsWith("~/")) return normalizePath("/home/student/" + input.slice(2));
    if (input.startsWith("/")) return normalizePath(input);
    return normalizePath((cwd === "/" ? "" : cwd) + "/" + input);
  }

  function parentPath(path) {
    const parts = normalizePath(path).split("/").filter(Boolean);
    parts.pop();
    return "/" + parts.join("/") || "/";
  }

  function baseName(path) {
    const parts = normalizePath(path).split("/").filter(Boolean);
    return parts[parts.length - 1] || "/";
  }

  function entryExists(path) {
    const normalized = normalizePath(path);
    return Boolean(fakeFiles[normalized] || fakeFileContents[normalized]);
  }

  function addEntry(path, isDirectory, content) {
    const normalized = normalizePath(path);
    const parent = parentPath(normalized);
    const name = baseName(normalized);
    if (!fakeFiles[parent]) return `cannot create '${path}': parent directory does not exist`;
    if (!fakeFiles[parent].includes(name)) fakeFiles[parent].push(name);
    fakeFiles[parent].sort((a, b) => a.localeCompare(b));
    if (isDirectory) {
      fakeFiles[normalized] = fakeFiles[normalized] || [];
      delete fakeFileContents[normalized];
    } else {
      fakeFileContents[normalized] = content || "";
      delete fakeFiles[normalized];
    }
    return "";
  }

  function removeEntry(path, recursive) {
    const normalized = normalizePath(path);
    if (normalized === "/" || normalized === "/home" || normalized === "/home/student") {
      return `rm: refusing to remove protected lab directory '${path}'`;
    }
    if (!entryExists(normalized)) return `rm: cannot remove '${path}': No such file or directory`;
    if (fakeFiles[normalized] && fakeFiles[normalized].length && !recursive) {
      return `rm: cannot remove '${path}': Is a directory`;
    }

    Object.keys(fakeFiles).forEach((dir) => {
      if (dir === normalized || dir.startsWith(normalized + "/")) delete fakeFiles[dir];
    });
    Object.keys(fakeFileContents).forEach((file) => {
      if (file === normalized || file.startsWith(normalized + "/")) delete fakeFileContents[file];
    });

    const parent = parentPath(normalized);
    const name = baseName(normalized);
    if (fakeFiles[parent]) fakeFiles[parent] = fakeFiles[parent].filter((entry) => entry !== name);
    if (cwd === normalized || cwd.startsWith(normalized + "/")) cwd = parent;
    return "";
  }

  function cloneEntry(source, destination) {
    const normalizedSource = normalizePath(source);
    const normalizedDestination = normalizePath(destination);
    if (fakeFiles[normalizedSource]) {
      const error = addEntry(normalizedDestination, true);
      if (error) return error;
      Object.keys(fakeFiles)
        .filter((path) => path.startsWith(normalizedSource + "/"))
        .sort((a, b) => a.length - b.length)
        .forEach((path) => {
          const target = normalizedDestination + path.slice(normalizedSource.length);
          addEntry(target, true);
          fakeFiles[target] = fakeFiles[path].slice();
        });
      Object.keys(fakeFileContents)
        .filter((path) => path.startsWith(normalizedSource + "/"))
        .forEach((path) => {
          const target = normalizedDestination + path.slice(normalizedSource.length);
          addEntry(target, false, fakeFileContents[path]);
        });
      return "";
    }
    return addEntry(normalizedDestination, false, fakeFileContents[normalizedSource]);
  }

  function listFindResults(startPath) {
    const start = normalizePath(startPath || cwd);
    const results = [];
    if (!entryExists(start)) return "";
    if (fakeFiles[start]) results.push(start);
    Object.keys(fakeFiles)
      .filter((path) => path !== start && path.startsWith(start === "/" ? "/" : start + "/"))
      .sort()
      .forEach((path) => results.push(path));
    Object.keys(fakeFileContents)
      .filter((path) => path === start || path.startsWith(start === "/" ? "/" : start + "/"))
      .sort()
      .forEach((path) => results.push(path));
    return results.map((path) => (path === cwd ? "." : path.replace(cwd + "/", "./"))).join("\n");
  }

  function output(type, text) {
    return { type, text };
  }

  function getPrompt() {
    const displayPath = cwd === "/home/student" ? "~" : cwd.startsWith("/home/student/") ? "~" + cwd.slice("/home/student".length) : cwd;
    return `student@linux-hackers-lab:${displayPath}$`;
  }

  function tokenizeCommand(input) {
    const tokens = [];
    let current = "";
    let quote = "";
    for (let index = 0; index < input.length; index += 1) {
      const char = input[index];
      if (quote) {
        if (char === quote) quote = "";
        else current += char;
        continue;
      }
      if (char === "'" || char === '"') {
        quote = char;
        continue;
      }
      if (/\s/.test(char)) {
        if (current) {
          tokens.push(current);
          current = "";
        }
        continue;
      }
      if (char === ">") {
        if (current) {
          tokens.push(current);
          current = "";
        }
        if (input[index + 1] === ">") {
          tokens.push(">>");
          index += 1;
        } else {
          tokens.push(">");
        }
        continue;
      }
      current += char;
    }
    if (current) tokens.push(current);
    return tokens;
  }

  function stripOptions(args) {
    return args.filter((arg) => !arg.startsWith("-"));
  }

  function safeTarget(args) {
    return args.filter((arg) => !arg.startsWith("-")).pop() || "scanme.nmap.org";
  }

  function targetFromArgs(args) {
    return args.filter((arg) => !arg.startsWith("-")).pop() || "example.com";
  }

  function ensureDirectory(path) {
    const normalized = normalizePath(path);
    const parts = normalized.split("/").filter(Boolean);
    let current = "/";
    for (const part of parts) {
      current = normalizePath(current + "/" + part);
      if (fakeFileContents[current]) return `cannot create directory '${path}': Not a directory`;
      if (!fakeFiles[current]) {
        const error = addEntry(current, true);
        if (error) return error;
      }
    }
    return "";
  }

  function writeFile(path, content, append) {
    const normalized = normalizePath(path);
    if (fakeFiles[normalized]) return `cannot write '${path}': Is a directory`;
    const parent = parentPath(normalized);
    if (!fakeFiles[parent]) return `cannot write '${path}': parent directory does not exist`;
    const nextContent = append && Object.prototype.hasOwnProperty.call(fakeFileContents, normalized) ? fakeFileContents[normalized] + content : content;
    return addEntry(normalized, false, nextContent);
  }

  function simulatedCommand(cmd, args) {
    const target = args.find((arg) => !arg.startsWith("-")) || "lab-target";
    return [
      output("output", `${cmd}: accepted in Linux-Hackers Practice Lab`),
      output("output", `mode: safe browser simulation; no real process, network packet, exploit, or system change was executed`),
      output("output", `args: ${args.length ? args.join(" ") : "(none)"}`),
      output("output", `tip: use '${cmd} --help' in a real Kali VM/container for exact flags and real behavior`),
      output("output", `target/context: ${target}`),
    ];
  }

  function runPracticeCommand(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return [];

    const tokens = tokenizeCommand(trimmed);
    const redirectIndex = tokens.findIndex((token) => token === ">" || token === ">>");
    const redirectOperator = redirectIndex >= 0 ? tokens[redirectIndex] : "";
    const redirectTarget = redirectIndex >= 0 ? tokens[redirectIndex + 1] : "";
    const commandTokens = redirectIndex >= 0 ? tokens.slice(0, redirectIndex) : tokens;
    const [cmd, ...args] = commandTokens;
    const rest = args.join(" ");
    const lower = (cmd || "").toLowerCase();

    if (!cmd) return [];

    switch (lower) {
      case "help":
        return [
          output("output", "Linux-Hackers Practice Lab commands:"),
          output("output", "  help, clear, whoami, pwd, ls, cd, cat, echo, date, uname"),
          output("output", "  mkdir, mkdir -p, rmdir, touch, rm, rm -rf, cp, mv, find, grep"),
          output("output", "  echo hello > file.txt, echo more >> file.txt, cat, head, tail, wc"),
          output("output", "  ps, top, df, du, free, history, ip, ifconfig, ping, curl, wget"),
          output("output", "  bash, sh, python, python3, chmod, apt, git, ssh, scp, rsync"),
          output("output", "  dig, host, nslookup, traceroute, ss, netstat, tcpdump, tshark, nc"),
          output("output", "  nmap, nikto, sqlmap, gobuster, hydra, hashcat, john, aircrack-ng, msfconsole"),
          output("output", "  Unknown Linux/Kali commands are accepted as safe simulated practice runs."),
          output("output", "Filesystem changes are real inside this tab session, but reset when the website closes or reloads."),
          output("output", "Security-tool outputs are safe simulations for legal education only."),
        ];
      case "whoami":
        return [output("output", "student")];
      case "pwd":
        return [output("output", cwd)];
      case "date":
        return [output("output", new Date().toString())];
      case "echo": {
        if (redirectOperator) {
          if (!redirectTarget) return [output("error", "bash: syntax error near unexpected token `newline'")];
          const error = writeFile(resolvePath(redirectTarget), rest + "\n", redirectOperator === ">>");
          return error ? [output("error", `bash: ${error}`)] : [];
        }
        return [output("output", rest)];
      }
      case "uname":
        return [output("output", "Linux linux-hackers-lab 6.8.0-kali-amd64 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux")];
      case "ls": {
        const operand = stripOptions(args)[0];
        const path = operand ? resolvePath(operand) : cwd;
        if (fakeFiles[path]) return [output("output", fakeFiles[path].join("  "))];
        if (Object.prototype.hasOwnProperty.call(fakeFileContents, path)) return [output("output", baseName(path))];
        return [output("error", `ls: cannot access '${path}': No such file or directory`)];
      }
      case "cd": {
        const path = resolvePath(args[0]);
        if (fakeFiles[path]) {
          cwd = path;
          return [];
        }
        return [output("error", `bash: cd: ${args[0] || path}: No such file or directory`)];
      }
      case "cat":
        if (!args[0]) return [output("error", "cat: missing operand")];
        return args
          .filter((arg) => !arg.startsWith("-"))
          .flatMap((file) => {
            const path = resolvePath(file);
            if (fakeFiles[path]) return [output("error", `cat: ${file}: Is a directory`)];
            if (Object.prototype.hasOwnProperty.call(fakeFileContents, path)) return [output("output", fakeFileContents[path])];
            return [output("error", `cat: ${file}: No such file or directory`)];
          });
      case "mkdir":
        if (!stripOptions(args).length) return [output("error", "mkdir: missing operand")];
        return stripOptions(args)
          .map((dir) => {
            const path = resolvePath(dir);
            const recursive = args.includes("-p");
            if (entryExists(path)) {
              return recursive && fakeFiles[path]
                ? output("output", "")
                : output("error", `mkdir: cannot create directory '${dir}': File exists`);
            }
            const error = recursive ? ensureDirectory(path) : addEntry(path, true);
            return error ? output("error", `mkdir: ${error}`) : output("output", `created directory: ${dir}`);
          });
      case "touch":
        if (!stripOptions(args).length) return [output("error", "touch: missing file operand")];
        return stripOptions(args)
          .map((file) => {
            const path = resolvePath(file);
            if (fakeFiles[path]) return output("error", `touch: cannot touch '${file}': Is a directory`);
            const error = addEntry(path, false, fakeFileContents[path] || "");
            return error ? output("error", `touch: ${error}`) : output("output", `touched file: ${file}`);
          });
      case "nano":
      case "vim":
      case "vi":
        if (!stripOptions(args).length) return [output("output", `${cmd}: simulated editor. Usage: ${cmd} <file>`)];
        {
          const file = stripOptions(args)[0];
          const path = resolvePath(file);
          if (fakeFiles[path]) return [output("error", `${cmd}: ${file}: Is a directory`)];
          const content = fakeFileContents[path] || "# Edited in Linux-Hackers Practice Lab\n";
          const error = addEntry(path, false, content);
          return error ? [output("error", `${cmd}: ${error}`)] : [output("output", `${cmd}: opened and saved ${file} in this session only`)];
        }
      case "rmdir":
        if (!stripOptions(args).length) return [output("error", "rmdir: missing operand")];
        return stripOptions(args).map((target) => {
          const path = resolvePath(target);
          if (!fakeFiles[path]) return output("error", `rmdir: failed to remove '${target}': No such directory`);
          if (fakeFiles[path].length) return output("error", `rmdir: failed to remove '${target}': Directory not empty`);
          const error = removeEntry(path, false);
          return error ? output("error", error) : output("output", `removed directory: ${target}`);
        });
      case "rm":
        if (!stripOptions(args).length) return [output("error", "rm: missing operand")];
        return stripOptions(args)
          .map((target) => {
            const error = removeEntry(resolvePath(target), args.some((arg) => arg.includes("r")));
            return error ? output("error", error) : output("output", `removed: ${target}`);
          });
      case "cp":
        if (stripOptions(args).length < 2) return [output("error", "cp: missing source or destination")];
        {
          const operands = stripOptions(args);
          const source = resolvePath(operands[0]);
          let destination = resolvePath(operands[1]);
          if (!entryExists(source)) return [output("error", `cp: cannot stat '${operands[0]}': No such file or directory`)];
          if (fakeFiles[destination]) destination = normalizePath(destination + "/" + baseName(source));
          if (fakeFiles[source] && !args.some((arg) => arg.includes("r"))) return [output("error", `cp: -r not specified; omitting directory '${operands[0]}'`)];
          const error = cloneEntry(source, destination);
          if (error) return [output("error", `cp: ${error}`)];
          return [output("output", `copied: ${operands[0]} -> ${operands[1]}`)];
        }
      case "mv":
        if (stripOptions(args).length < 2) return [output("error", "mv: missing source or destination")];
        {
          const operands = stripOptions(args);
          const source = resolvePath(operands[0]);
          let destination = resolvePath(operands[1]);
          if (!entryExists(source)) return [output("error", `mv: cannot stat '${operands[0]}': No such file or directory`)];
          if (fakeFiles[destination]) destination = normalizePath(destination + "/" + baseName(source));
          const error = cloneEntry(source, destination);
          if (error) return [output("error", `mv: ${error}`)];
          removeEntry(source, true);
          if (cwd === source || cwd.startsWith(source + "/")) cwd = destination + cwd.slice(source.length);
          return [output("output", `moved: ${operands[0]} -> ${operands[1]}`)];
        }
      case "find":
        {
          const start = resolvePath(stripOptions(args)[0] || ".");
          const found = listFindResults(start);
          return found ? [output("output", found)] : [output("error", `find: '${start}': No such file or directory`)];
        }
      case "grep":
        {
          const pattern = stripOptions(args)[0];
          if (!pattern) return [output("error", "grep: missing pattern")];
          const matches = Object.entries(fakeFileContents)
            .filter(([path, content]) => path.startsWith(cwd + "/") && content.toLowerCase().includes(pattern.toLowerCase()))
            .map(([path, content]) => `${path.replace(cwd + "/", "")}:1:${content.split("\n")[0]}`);
          return [output("output", matches.join("\n") || "grep: no matches in current practice directory")];
        }
      case "head":
      case "tail":
        return [output("output", "line 1: simulated sample output\nline 2: safe practice lab data\nline 3: no real system access")];
      case "wc":
        return [output("output", "  3   12   84 " + (args[0] || "stdin"))];
      case "ps":
        return [output("output", "PID TTY          TIME CMD\n100 pts/0    00:00:00 bash\n141 pts/0    00:00:00 practice-shell")];
      case "top":
        return [output("output", "top - sandbox snapshot: 2 tasks, 0 real processes affected, CPU 0.0%, Mem simulated")];
      case "df":
        return [output("output", "Filesystem      Size  Used Avail Use% Mounted on\nsandboxfs        20G  1.2G   19G   6% /")];
      case "du":
        return [output("output", "4.0K\t./notes.txt\n12K\t./wordlists\n20K\t.")];
      case "free":
        return [output("output", "              total        used        free\nMem:           4096         512        3584\nSwap:          1024           0        1024")];
      case "history":
        return [output("output", "Command history is available with your keyboard Up/Down arrows in this session.")];
      case "chmod":
      case "chown":
      case "ln":
        return [output("output", `${cmd}: permissions/links updated in session metadata only (simulated).`)];
      case "apt":
      case "apt-get":
      case "dpkg":
      case "pip":
      case "pip3":
        return [
          output("output", `${cmd}: package operation simulated`),
          output("output", "Reading package lists... Done"),
          output("output", "No packages were downloaded or installed in this browser lab."),
        ];
      case "git":
        return [
          output("output", `git ${rest || "--help"} [simulated]`),
          output("output", "Repository/network operations are not performed in the browser practice lab."),
        ];
      case "bash":
      case "sh":
      case "python":
      case "python3":
      case "perl":
      case "ruby":
      case "node":
        return [
          output("output", `${cmd}: script execution simulated`),
          output("output", args[0] ? `loaded script: ${args[0]}` : "interactive mode is not available in this browser lab"),
          output("output", "The command was accepted for practice, but no real code was executed."),
        ];
      case "awk":
      case "sed":
      case "cut":
      case "sort":
      case "uniq":
      case "tr":
      case "xargs":
      case "crontab":
        return simulatedCommand(cmd, args);
      case "ip":
      case "ifconfig":
        return [
          output("output", "eth0: inet 10.10.10.25/24 brd 10.10.10.255 scope global eth0"),
          output("output", "lo:   inet 127.0.0.1/8 scope host lo"),
        ];
      case "ping":
        return [
          output("output", `PING ${args[0] || "example.com"} (93.184.216.34): 56 data bytes`),
          output("output", "64 bytes: icmp_seq=1 ttl=56 time=22.4 ms [simulated]"),
          output("output", "--- sandbox ping stopped after 1 packet; no network traffic sent ---"),
        ];
      case "curl":
      case "wget":
        return [output("output", `${cmd}: fetched sample response from sandbox cache. No external request was made.`)];
      case "dig":
      case "host":
      case "nslookup":
        return [
          output("output", `${cmd}: DNS lookup for ${targetFromArgs(args)} [simulated]`),
          output("output", "93.184.216.34"),
          output("output", "No real DNS request was sent."),
        ];
      case "traceroute":
      case "tracepath":
        return [
          output("output", `traceroute to ${targetFromArgs(args)} [simulated]`),
          output("output", "1  10.10.10.1  1.2 ms"),
          output("output", "2  198.51.100.1  8.4 ms"),
          output("output", "3  93.184.216.34  22.8 ms"),
        ];
      case "ss":
      case "netstat":
        return [output("output", "Netid State  Local Address:Port  Peer Address:Port\nudp   UNCONN 127.0.0.1:53      0.0.0.0:*\ntcp   LISTEN 127.0.0.1:8080    0.0.0.0:*  [simulated]")];
      case "tcpdump":
      case "tshark":
      case "wireshark":
        return [output("output", `${cmd}: packet capture simulated\n1 0.000000 10.10.10.25 -> 93.184.216.34 TCP SYN\n2 0.021000 93.184.216.34 -> 10.10.10.25 TCP SYN,ACK\nNo interface was opened.`)];
      case "nc":
      case "netcat":
      case "ncat":
      case "socat":
        return [output("output", `${cmd}: connection simulation to ${targetFromArgs(args)}\nConnected [simulated]. No socket was opened.`)];
      case "ssh":
      case "scp":
      case "sftp":
      case "rsync":
        return [output("output", `${cmd}: remote operation simulated. No login, transfer, or network connection occurred.`)];
      case "nmap":
        return [
          output("output", "Starting Nmap 7.95 ( https://nmap.org ) [PRACTICE LAB]"),
          output("output", `Nmap scan report for ${safeTarget(args)}`),
          output("output", "PORT     STATE SERVICE\n22/tcp   open  ssh\n80/tcp   open  http\n443/tcp  open  https"),
          output("output", "Nmap done: simulated scan completed without touching any host."),
        ];
      case "nikto":
        return [output("output", "- Nikto v2.5.0 [PRACTICE LAB]\n+ Server: Apache/2.4.57\n+ /admin/: sample finding\n+ No requests were sent.")];
      case "sqlmap":
        return [output("output", "sqlmap identified a simulated injectable parameter: id\nPayload: ' OR '1'='1\nResult: educational output only; no target was contacted.")];
      case "gobuster":
      case "dirb":
      case "ffuf":
        return [output("output", "/admin (Status: 200) [Size: 1234]\n/login (Status: 200) [Size: 980]\nSimulated directory enumeration only.")];
      case "hydra":
        return [output("output", "Hydra v9.5 [PRACTICE LAB]\n[DATA] using demo credentials\n[STATUS] no login attempts were sent")];
      case "hashcat":
      case "john":
        return [output("output", `${cmd}: loaded demo hash set\nRecovered: password123 [simulated]\nNo GPU/CPU cracking was performed.`)];
      case "aircrack-ng":
      case "airodump-ng":
        return [output("output", `${cmd}: wireless practice output is simulated. No adapter or radio activity was used.`)];
      case "masscan":
      case "arp-scan":
      case "hping3":
      case "zmap":
        return [output("output", `${cmd}: high-speed/network packet tool simulated for ${targetFromArgs(args)}. No packets were sent.`)];
      case "wpscan":
      case "whatweb":
      case "ffuf":
      case "dirsearch":
      case "wfuzz":
        return [output("output", `${cmd}: web testing simulation\nTarget: ${targetFromArgs(args)}\nResult: sample finding only; no HTTP request was sent.`)];
      case "msfconsole":
        return [output("output", "       =[ metasploit v6.4.0-dev ]\n+ -- --=[ Practice lab mode: modules are simulated, no exploits run ]\nmsf6 >")];
      case "sudo":
      case "su":
        return [output("error", `${cmd}: disabled. This browser lab never grants real system privileges.`)];
      default:
        return simulatedCommand(cmd, args);
    }
  }

  function appendTerminalLines(input, command, lines) {
    const row = input.closest(".flex.items-center");
    const scrollArea = row && row.parentElement;
    if (!row || !scrollArea) return;

    const promptElement = row.querySelector("span");
    const prompt = promptElement?.textContent || getPrompt();
    const commandLine = document.createElement("div");
    commandLine.className = "text-primary whitespace-pre-wrap";
    commandLine.textContent = `${prompt} ${command}`;
    scrollArea.insertBefore(commandLine, row);

    lines.forEach((line) => {
      if (line.text === "__CLEAR__") {
        Array.from(scrollArea.children).forEach((child) => child !== row && child.remove());
        return;
      }
      const item = document.createElement("div");
      item.className = line.type === "error" ? "text-red-400 whitespace-pre-wrap" : "text-foreground/90 whitespace-pre-wrap";
      item.textContent = line.text;
      scrollArea.insertBefore(item, row);
    });

    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    if (promptElement) promptElement.textContent = getPrompt();
    scrollArea.scrollTop = scrollArea.scrollHeight;
  }

  function patchTerminalLabels(root) {
    const scope = root || document;
    scope.querySelectorAll("*").forEach((node) => {
      if (node.childNodes.length !== 1 || !node.firstChild || node.firstChild.nodeType !== Node.TEXT_NODE) return;
      node.textContent = node.textContent
        .replace("DEMO ONLY", "PRACTICE LAB")
        .replace("Demo Only", "Practice Lab")
        .replace("Available demo commands", "Available practice commands")
        .replace("Type 'help' to see available demo commands.", "Type 'help' to practice Linux and Kali-style commands.")
        .replace("This is a SAFE simulated environment for learning commands.", "This is a safe Linux practice environment for education.")
        .replace("All outputs you see are pre-defined demo responses for educational purposes only.", "Security-tool outputs are simulated so this website cannot affect real systems.");
    });
  }

  function bindTerminalPracticeLayer() {
    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key !== "Enter") return;
        const input = event.target;
        if (!(input instanceof HTMLInputElement)) return;
        const terminal = input.closest(".bg-black\\/95");
        if (!terminal || !terminal.textContent.includes("Terminal Sandbox")) return;

        const command = input.value;
        const lines = command.trim() === "clear" ? [output("output", "__CLEAR__")] : runPracticeCommand(command);
        event.preventDefault();
        event.stopImmediatePropagation();
        appendTerminalLines(input, command, lines);
      },
      true
    );
  }

  function slugifyToolName(text) {
    const cleaned = (text || "")
      .replace(/^view\s+full\s+/i, "")
      .replace(/\s+details.*$/i, "")
      .replace(/[^a-zA-Z0-9+_.-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase();
    return cleaned || "";
  }

  function fixViewFullDetailsButton() {
    document.addEventListener(
      "click",
      (event) => {
        const target = event.target.closest("button, a");
        if (!target) return;
        const text = (target.textContent || "").trim();
        if (!/view full .*details/i.test(text)) return;

        const slug = slugifyToolName(text);
        if (!slug) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        window.open(`https://www.kali.org/tools/${encodeURIComponent(slug)}/`, "_blank", "noopener,noreferrer");
      },
      true
    );
  }

  let cachedToolSuggestions = null;

  async function loadToolSuggestions() {
    if (cachedToolSuggestions) return cachedToolSuggestions;
    try {
      const response = await fetch("./kali-tools.json");
      if (!response.ok) throw new Error("Could not load tools");
      const data = await response.json();
      cachedToolSuggestions = Array.isArray(data.tools) ? data.tools : [];
    } catch {
      cachedToolSuggestions = [];
    }
    return cachedToolSuggestions;
  }

  function scoreTool(tool, query) {
    const name = (tool.name || "").toLowerCase();
    const id = (tool.id || "").toLowerCase();
    const description = (tool.shortDescription || "").toLowerCase();
    const category = (tool.category || "").toLowerCase();
    if (name === query || id === query) return 100;
    if (name.startsWith(query) || id.startsWith(query)) return 80;
    if (name.includes(query) || id.includes(query)) return 60;
    if (category.includes(query)) return 35;
    if (description.includes(query)) return 25;
    return 0;
  }

  function getSuggestionBox(input) {
    const wrapper = input.closest(".relative") || input.parentElement;
    if (!wrapper) return null;
    let box = wrapper.querySelector(".lh-tool-suggestions");
    if (!box) {
      box = document.createElement("div");
      box.className = "lh-tool-suggestions";
      wrapper.appendChild(box);
    }
    return box;
  }

  function triggerExistingSearch(input, toolName) {
    input.value = toolName;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", bubbles: true }));
  }

  async function renderToolSuggestions(input) {
    const query = input.value.trim().toLowerCase();
    const box = getSuggestionBox(input);
    if (!box) return;
    if (query.length < 1) {
      box.hidden = true;
      box.innerHTML = "";
      return;
    }

    const tools = await loadToolSuggestions();
    const matches = tools
      .map((tool) => ({ tool, score: scoreTool(tool, query) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || (a.tool.name || "").localeCompare(b.tool.name || ""))
      .slice(0, 8);

    if (!matches.length) {
      box.hidden = false;
      box.innerHTML = `<div class="lh-tool-suggestion-empty">No related tools found</div>`;
      return;
    }

    box.hidden = false;
    box.innerHTML = matches
      .map(
        ({ tool }) => `
          <button type="button" class="lh-tool-suggestion" data-tool-name="${String(tool.name || tool.id || "").replace(/"/g, "&quot;")}">
            <span class="lh-tool-suggestion-name">${tool.name || tool.id}</span>
            <span class="lh-tool-suggestion-meta">${tool.category || "Kali tool"}</span>
            <span class="lh-tool-suggestion-desc">${tool.shortDescription || ""}</span>
          </button>
        `
      )
      .join("");
  }

  function bindToolSearchSuggestions() {
    document.addEventListener("input", (event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement)) return;
      if (!/search kali tool/i.test(input.placeholder || "")) return;
      renderToolSuggestions(input);
    });

    document.addEventListener("focusin", (event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement)) return;
      if (!/search kali tool/i.test(input.placeholder || "")) return;
      renderToolSuggestions(input);
    });

    document.addEventListener("click", (event) => {
      const suggestion = event.target.closest(".lh-tool-suggestion");
      if (!suggestion) {
        document.querySelectorAll(".lh-tool-suggestions").forEach((box) => {
          if (!box.contains(event.target)) box.hidden = true;
        });
        return;
      }

      const wrapper = suggestion.closest(".relative");
      const input = wrapper && wrapper.querySelector("input[placeholder*='Search Kali tool']");
      if (!input) return;
      event.preventDefault();
      triggerExistingSearch(input, suggestion.dataset.toolName || suggestion.querySelector(".lh-tool-suggestion-name")?.textContent || "");
      const box = suggestion.closest(".lh-tool-suggestions");
      if (box) box.hidden = true;
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function findBestToolForQuery(tools, query) {
    const lowered = query.toLowerCase();
    const direct = tools.find((tool) => lowered.includes((tool.name || "").toLowerCase()) || lowered.includes((tool.id || "").toLowerCase()));
    if (direct) return direct;
    return tools
      .map((tool) => ({ tool, score: scoreTool(tool, lowered) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)[0]?.tool;
  }

  function genericTopic(query) {
    const lowered = query.toLowerCase();
    if (/scan|port|network|host|ip/.test(lowered)) return "network scanning and reconnaissance";
    if (/web|site|url|http|xss|sql|injection/.test(lowered)) return "web application testing";
    if (/password|hash|brute|wordlist|login/.test(lowered)) return "password auditing";
    if (/wifi|wireless|aircrack|wpa/.test(lowered)) return "wireless security practice";
    if (/forensic|file|memory|recover|log/.test(lowered)) return "digital forensics";
    if (/linux|command|terminal|shell|file|directory/.test(lowered)) return "Linux command-line practice";
    return "Kali Linux and cybersecurity learning";
  }

  function buildDetailedAnswerHtml(query, tool) {
    const topic = tool ? `${tool.name} (${tool.category})` : genericTopic(query);
    const commands = tool?.commands?.length
      ? tool.commands.slice(0, 5)
      : [
          { command: "man <command>", description: "Read the official manual page and options." },
          { command: "<command> --help", description: "Check supported flags before running a tool." },
          { command: "mkdir lab-notes && cd lab-notes", description: "Keep practice output organized in a lab folder." },
        ];
    const install = tool?.installCommand || "sudo apt update && sudo apt install <tool-name>";
    const syntax = tool?.basicSyntax || "<tool-name> --help";
    const directAnswer = tool
      ? `${tool.name} is a Kali Linux tool in the ${tool.category} category. Use it in a lab to learn its purpose, flags, and output format before applying it in any authorized assessment.`
      : `You are asking about ${topic}. The practical approach is to define the objective, choose the safest command, run it in a lab, then interpret the output before taking the next step.`;
    const explanation = tool
      ? escapeHtml(tool.fullDescription || tool.shortDescription)
      : `For this topic, I would treat it as a learning task first: identify what you are trying to discover, pick the least intrusive method, document the command, and verify that the target is legal to test.`;

    return `
      <div class="lh-ai-detailed-answer">
        <div class="lh-ai-detail-head">
          <span>Agent Response</span>
          <small>${escapeHtml(topic)}</small>
        </div>
        <section>
          <h3>Direct answer</h3>
          <p>${escapeHtml(directAnswer)}</p>
        </section>
        <section>
          <h3>Reasoning</h3>
          <p>${explanation}</p>
        </section>
        <section>
          <h3>Assumptions I am making</h3>
          <ol>
            <li>You are practicing in an educational lab or on systems you own.</li>
            <li>You want to understand the command and output, not blindly copy a payload.</li>
            <li>You need a safe workflow that avoids real-world unauthorized activity.</li>
          </ol>
        </section>
        <section>
          <h3>Recommended plan</h3>
          <ol>
            <li>Clarify the exact objective: learn syntax, inspect output, or solve a lab task.</li>
            <li>Run the help command first and identify the required arguments.</li>
            <li>Use a harmless demo target or your own local lab VM.</li>
            <li>Run one small command, read the output, then adjust one option at a time.</li>
            <li>Write down what changed and what the result proves.</li>
          </ol>
        </section>
        <section>
          <h3>Commands I would try first</h3>
          <div class="lh-ai-command-list">
            <div><code>${escapeHtml(install)}</code><span>Install or verify the tool in Kali Linux.</span></div>
            <div><code>${escapeHtml(syntax)}</code><span>Start by reading supported options.</span></div>
            ${commands
              .map(
                (item) =>
                  `<div><code>${escapeHtml(item.command)}</code><span>${escapeHtml(item.description || item.whenToUse || "Practice this command in a legal lab.")}</span></div>`
              )
              .join("")}
          </div>
        </section>
        <section>
          <h3>How I would interpret results</h3>
          <p>First check whether the command actually ran, then inspect the target, status, errors, and discovered values. A useful result should answer what was checked, what was found, and what remains uncertain. If the result is noisy, reduce options and repeat in a smaller lab case.</p>
        </section>
        <section>
          <h3>Next step</h3>
          <p>Try the simplest help or syntax command in the Terminal Sandbox, then ask a more specific follow-up such as “explain this nmap output” or “which option should I use for a local lab scan”.</p>
        </section>
        <section class="lh-ai-warning">
          <h3>Boundary</h3>
          <p>Only test systems you own or have explicit written permission to test. This website should be used for education and lab practice, not unauthorized scanning, exploitation, credential attacks, or disruption.</p>
        </section>
      </div>
    `;
  }

  function findAiQuery(button) {
    const card = button.closest(".cyber-card") || button.closest("div");
    if (!card) return "";
    const fields = Array.from(card.querySelectorAll("textarea, input"))
      .filter((field) => !/search kali tool/i.test(field.placeholder || ""))
      .map((field) => field.value.trim())
      .filter(Boolean);
    return fields[fields.length - 1] || "";
  }

  async function renderDetailedAiAnswer(button, query) {
    const card = button.closest(".cyber-card") || button.closest("div");
    if (!card || !query.trim()) return;
    const tools = await loadToolSuggestions();
    const tool = findBestToolForQuery(tools, query);
    let existing = card.querySelector(".lh-ai-detailed-answer");
    if (existing) existing.remove();

    const holder = document.createElement("div");
    holder.innerHTML = buildDetailedAnswerHtml(query, tool);
    card.appendChild(holder.firstElementChild);
  }

  function bindDetailedAiAssistant() {
    document.addEventListener(
      "click",
      (event) => {
        const button = event.target.closest("button");
        if (!button || !/^get answer$/i.test((button.textContent || "").trim())) return;
        const query = findAiQuery(button);
        window.setTimeout(() => renderDetailedAiAnswer(button, query), 650);
      },
      true
    );
  }

  function installStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .lh-existing-follow-actions {
        display: grid;
        gap: 10px;
        width: 100%;
        margin-top: 10px;
      }
      .lh-existing-follow-primary,
      .lh-existing-follow-secondary {
        display: flex !important;
        align-items: center;
        justify-content: center;
        width: 100%;
        border-radius: 12px;
        padding: 12px 14px;
        font-weight: 800;
        transition: transform 0.2s ease, background 0.2s ease;
      }
      .lh-existing-follow-primary {
        color: #06110c;
        background: linear-gradient(135deg, #00ff88, #00d4ff);
      }
      .lh-existing-follow-secondary {
        color: #a8bfb5;
        background: rgba(255,255,255,0.06);
      }
      .lh-existing-follow-primary:hover,
      .lh-existing-follow-secondary:hover {
        transform: translateY(-1px);
      }
      .lh-tool-suggestions {
        position: absolute;
        z-index: 80;
        top: calc(100% + 8px);
        left: 0;
        right: 0;
        max-height: 360px;
        overflow-y: auto;
        border: 1px solid rgba(0, 255, 136, 0.28);
        border-radius: 14px;
        background: rgba(4, 12, 10, 0.98);
        box-shadow: 0 18px 50px rgba(0,0,0,0.55), 0 0 24px rgba(0,255,136,0.1);
        padding: 8px;
      }
      .lh-tool-suggestion {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 2px 12px;
        padding: 10px 12px;
        border-radius: 10px;
        text-align: left;
        color: hsl(var(--foreground));
      }
      .lh-tool-suggestion:hover {
        background: rgba(0, 255, 136, 0.1);
      }
      .lh-tool-suggestion-name {
        font-family: JetBrains Mono, monospace;
        color: hsl(var(--primary));
        font-weight: 800;
      }
      .lh-tool-suggestion-meta {
        color: hsl(var(--muted-foreground));
        font-size: 11px;
      }
      .lh-tool-suggestion-desc {
        grid-column: 1 / -1;
        color: hsl(var(--muted-foreground));
        font-size: 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .lh-tool-suggestion-empty {
        padding: 12px;
        color: hsl(var(--muted-foreground));
        font-size: 13px;
        text-align: center;
      }
      .lh-ai-detailed-answer {
        margin: 16px;
        padding: 18px;
        border: 1px solid rgba(0, 255, 136, 0.24);
        border-radius: 14px;
        background: rgba(0, 0, 0, 0.28);
        color: hsl(var(--foreground));
        max-height: 52vh;
        overflow-y: auto;
      }
      .lh-ai-detail-head {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: center;
        margin-bottom: 14px;
        color: hsl(var(--primary));
        font-weight: 800;
      }
      .lh-ai-detail-head small {
        color: hsl(var(--muted-foreground));
        font-weight: 600;
        text-align: right;
      }
      .lh-ai-detailed-answer section {
        margin-top: 14px;
      }
      .lh-ai-detailed-answer h3 {
        margin-bottom: 6px;
        color: hsl(var(--primary));
        font-size: 14px;
        font-weight: 800;
      }
      .lh-ai-detailed-answer p,
      .lh-ai-detailed-answer li {
        color: hsl(var(--foreground) / 0.88);
        font-size: 13px;
        line-height: 1.65;
      }
      .lh-ai-detailed-answer ol {
        list-style: decimal;
        padding-left: 20px;
      }
      .lh-ai-command-list {
        display: grid;
        gap: 8px;
      }
      .lh-ai-command-list div {
        display: grid;
        gap: 4px;
        padding: 10px;
        border-radius: 10px;
        background: rgba(0,0,0,0.32);
        border: 1px solid rgba(255,255,255,0.08);
      }
      .lh-ai-command-list code {
        color: #00ff88;
        white-space: pre-wrap;
        word-break: break-word;
      }
      .lh-ai-command-list span {
        color: hsl(var(--muted-foreground));
        font-size: 12px;
      }
      .lh-ai-warning {
        border-left: 3px solid hsl(var(--warning));
        padding-left: 12px;
      }
    `;
    document.head.appendChild(style);
  }

  document.addEventListener("DOMContentLoaded", () => {
    installStyles();
    bindTerminalPracticeLayer();
    fixViewFullDetailsButton();
    bindToolSearchSuggestions();
    bindDetailedAiAssistant();
    updateExistingInstagramPopup(document);
    patchTerminalLabels(document);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          updateExistingInstagramPopup(node);
          patchTerminalLabels(node);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
