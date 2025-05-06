import { spawn } from "child_process";
import path from "path";
import { Faq } from "@/types";

/**
 * Execute the Python search pipeline and return the results
 */
export async function executePythonSearch(query: string, language: string): Promise<Faq[]> {
  return new Promise((resolve, reject) => {
    // Assuming the Python script is in the 'python' directory
    const pythonScriptPath = path.join(process.cwd(), "python/search.py");
    
    // Spawn Python process
    const pythonProcess = spawn("python3", [
      pythonScriptPath,
      "--query", query,
      "--language", language
    ]);
    
    let outputData = "";
    let errorData = "";
    
    // Collect output data
    pythonProcess.stdout.on("data", (data) => {
      outputData += data.toString();
    });
    
    // Collect error data
    pythonProcess.stderr.on("data", (data) => {
      errorData += data.toString();
    });
    
    // Handle process completion
    pythonProcess.on("close", (code) => {
      if (code === 0) {
        try {
          // Try to parse the JSON output from the Python script
          const results: Faq[] = JSON.parse(outputData);
          resolve(results);
        } catch (error) {
          reject(new Error(`Failed to parse Python script output: ${error}`));
        }
      } else {
        reject(new Error(`Python search process exited with code ${code}: ${errorData}`));
      }
    });
    
    // Handle process errors
    pythonProcess.on("error", (error) => {
      reject(new Error(`Failed to execute Python search script: ${error.message}`));
    });
  });
}
