import { exec } from 'child_process';

/**
 * Seeds the database with test personas.
 * Runs `npx prisma db seed` with a 30 second timeout.
 *
 * Note: Uses exec() with hardcoded command - no user input involved.
 *
 * @returns Promise that resolves when seeding completes
 * @throws Error if seeding fails or times out
 */
export async function seedPersonas(): Promise<void> {
  const TIMEOUT_MS = 30000; // 30 seconds
  const SEED_COMMAND = 'npx prisma db seed'; // hardcoded, no user input

  return new Promise((resolve, reject) => {
    const seedProcess = exec(SEED_COMMAND, {
      cwd: process.cwd(),
      timeout: TIMEOUT_MS,
    });

    let stdout = '';
    let stderr = '';

    seedProcess.stdout?.on('data', (data) => {
      stdout += data;
    });

    seedProcess.stderr?.on('data', (data) => {
      stderr += data;
    });

    seedProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `Seed process exited with code ${code}.\nstdout: ${stdout}\nstderr: ${stderr}`
          )
        );
      }
    });

    seedProcess.on('error', (error) => {
      if (error.message.includes('ETIMEDOUT') || error.message.includes('killed')) {
        reject(new Error(`Seed process timed out after ${TIMEOUT_MS / 1000} seconds`));
      } else {
        reject(error);
      }
    });
  });
}

/**
 * Resets the database and reseeds with test personas.
 * Useful for ensuring a clean state before tests.
 *
 * Note: Uses exec() with hardcoded command - no user input involved.
 *
 * @returns Promise that resolves when reset and seeding complete
 * @throws Error if reset or seeding fails
 */
export async function resetAndSeedPersonas(): Promise<void> {
  const TIMEOUT_MS = 30000;
  const RESET_COMMAND = 'npx prisma migrate reset --force'; // hardcoded, no user input

  return new Promise((resolve, reject) => {
    const resetProcess = exec(RESET_COMMAND, {
      cwd: process.cwd(),
      timeout: TIMEOUT_MS,
    });

    let stdout = '';
    let stderr = '';

    resetProcess.stdout?.on('data', (data) => {
      stdout += data;
    });

    resetProcess.stderr?.on('data', (data) => {
      stderr += data;
    });

    resetProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `Reset process exited with code ${code}.\nstdout: ${stdout}\nstderr: ${stderr}`
          )
        );
      }
    });

    resetProcess.on('error', (error) => {
      if (error.message.includes('ETIMEDOUT') || error.message.includes('killed')) {
        reject(new Error(`Reset process timed out after ${TIMEOUT_MS / 1000} seconds`));
      } else {
        reject(error);
      }
    });
  });
}
