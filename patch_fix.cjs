const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>`;

const replacement = `                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>`;

code = code.replace(target, replacement);

fs.writeFileSync('src/App.tsx', code, 'utf8');
console.log("Fixed the closing tag");
