module.exports = {
    apps: [
       {
          name: "coneko-sv",
          script: "src/server.js",  
          instances: "max",
          exec_mode: "cluster",  
          env: {
          NODE_ENV: "development",
          exec_interpreter: "nodemon",  
          args: "--inspect",  
          },
          env_production: {
          NODE_ENV: "production",
          exec_interpreter: "node", 
          },
       },
    ],
 };