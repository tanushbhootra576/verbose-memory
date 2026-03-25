const fs = require('fs');
let code = fs.readFileSync('d:/cn/frontend/src/DoctorDashboard.js', 'utf8');

code = code.replace("import io from 'socket.io-client';\n", "");
code = code.replace("const socket = io(apiUrl);\n", "");

const oldLogic = `        // Fetch vital history
        axios.get(\`\${apiUrl}/api/vitals/\${patientId}\`)
            .then(res => {
                const sorted = res.data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                setHistory(sorted);
                if (sorted.length > 0) {
                    const latest = sorted[sorted.length - 1];
                    setVitals({ hr: latest.heartRate, spO2: latest.spO2 });
                }
            });

        // Real-time listener
        const eventName = \`vitals-\${patientId}\`;
        socket.on(eventName, (data) => {
            setVitals({ hr: data.heartRate, spO2: data.spO2 });
            setHistory(prev => {
                const next = [...prev, data];
                if (next.length > 50) next.shift(); // keep last 50
                return next;
            });

            if (data.spO2 < 90 || data.heartRate > 120 || data.heartRate < 50) {
                setAlert('CRITICAL: Abnormal Vitals Detected!');
            } else {
                setAlert(null);
            }
        });

        return () => socket.off(eventName);`;

const newLogic = `        // Fetch vital history
        const fetchVitals = () => {
            axios.get(\`\${apiUrl}/api/vitals/\${patientId}\`)
                .then(res => {
                    const sorted = res.data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                    setHistory(sorted);
                    if (sorted.length > 0) {
                        const latest = sorted[sorted.length - 1];
                        setVitals({ hr: latest.heartRate, spO2: latest.spO2 });

                        if (latest.spO2 < 90 || latest.heartRate > 120 || latest.heartRate < 50) {
                            setAlert('CRITICAL: Abnormal Vitals Detected!');
                        } else {
                            setAlert(null);
                        }
                    }
                }).catch(err => console.error(err));
        };
        fetchVitals();
        const interval = setInterval(fetchVitals, 2500);
        return () => clearInterval(interval);`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('d:/cn/frontend/src/DoctorDashboard.js', code);
