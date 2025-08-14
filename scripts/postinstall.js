#!/usr/bin/env node

console.log("\n🚀 Installation Complete!");
console.log(
  "\n⚠️  IMPORTANT: Don't forget to configure your environment variables before running the app!"
);
console.log(
  "\n📝 Create a .env.local file in the project root and add the following variables:"
);
console.log(
  "\n🔑 Alchemy Configuration (get from https://dashboard.alchemy.com/):"
);
console.log("   NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here");
console.log("   NEXT_PUBLIC_ALCHEMY_POLICY_ID=your_alchemy_policy_id_here");
console.log("\n🔐 Turnkey Configuration (get from https://app.turnkey.com/):");
console.log("   TURNKEY_API_PUBLIC_KEY=your_turnkey_public_key_here");
console.log("   TURNKEY_API_PRIVATE_KEY=your_turnkey_private_key_here");
console.log("   TURNKEY_ORGANIZATION_ID=your_turnkey_organization_id_here");
console.log("\n⚠️  Security Notes:");
console.log("   - Never commit .env.local to version control");
console.log("   - NEXT_PUBLIC_ variables are exposed to the browser");
console.log("   - Keep Turnkey private keys secure and server-side only");
console.log("\n📚 Setup Documentation:");
console.log("   - Alchemy: https://docs.alchemy.com/docs/api-keys");
console.log(
  "   - Turnkey: https://docs.turnkey.com/getting-started/quickstart"
);
console.log('\n💡 Run "npm run dev" to start the development server.\n');
