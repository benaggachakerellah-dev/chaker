import { execSync } from 'child_process';

function run(cmd) {
  console.log(`\n$ ${cmd}`);
  try {
    const out = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    console.log(out.trim());
  } catch (e) {
    console.log(e.stdout || '');
    console.error(e.stderr || e.message);
  }
}

console.log('=== RUNNING VERIFICATION COMMANDS ===');
run('node scripts/seed-demo.mjs');
run('node scripts/task1-check.mjs');
run('npm run build');
run('node scripts/get-product-id.mjs');
