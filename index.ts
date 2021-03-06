import { schedule } from 'node-cron';
import { promises } from 'fs';
const { readdir, rename, lstat } = promises;
import { join } from 'path';
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';
import { gzip } from 'zlib';
const exec = promisify(execCallback);

if (process.argv.length < 3 || process.argv[process.argv.length - 1] != '-i') {
    const cronSchedule = process.env.SCHEDULE || '0 0 * * *';
    schedule(cronSchedule, run);
    console.log(`Configured to run on schedule ${cronSchedule}`);
} else {
    console.log('Running now');
    run();
}

async function run() {
    console.log(`Running`);
    const path = process.env.LOGDIR || '/usr/logs';
    console.log(`Reading from directory ${path}`);

    const files = await readdir(path);

    files.forEach(async file => {
        const thisPath = join(path, file);
        const folderStats = lstat(thisPath);
        if ((await folderStats).isDirectory()) {
            eachDir(thisPath);
        }
    });
}

async function eachDir(folder: string) {
    console.log(`Processing directory ${folder}`);
    const files = await readdir(folder);
    files.forEach(async file => {
        if (file.endsWith('.log')) {
            console.log(`Processing ${file}`);
            const oldFile = join(folder, file);
            console.log(`Compressing`);
            try {
                await exec(`gzip ${oldFile}`);
            } catch (e) {
                console.warn(`gzip errored: ${e}`);
                try {
                    await exec(`rm -f ${oldFile}`);
                } catch (e) {
                    console.warn(`rm errored: ${e}`);
                }
            }
            console.log(`Renaming file`);
            await rename(`${oldFile}.gz`, join(folder, `${file}.${(new Date()).getTime()}.gz`));
        }
    });
}