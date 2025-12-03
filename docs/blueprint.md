# **App Name**: Bhashantar Bharati

## Core Features:

- Real-Time Translation: Translate Standard Marathi input to selected dialect in real-time using a hybrid rule-based and AI approach. Loading dots displayed while waiting for translation, and results stream as characters are generated.
- Dialect Selection: Dropdown menu to select the target Marathi dialect: Varhadi, Ahirani, Malvani, or Kolhapuri.
- Rule-Based Transformation: Apply initial, quick transformations based on a set of rules specific to each dialect.
- AI-Powered Refinement: Refine the rule-based output using a fine-tuned Gemini model for enhanced accuracy and naturalness, using it as a tool to decide if/when to incorporate data in the generated translation.
- Dictionary Rule Debugging: Display the dictionary rules as applied during the rule-based translation phase to help developers evaluate output of rule.
- Gemini Fine-Tuning: Enable upload and processing of JSONL dataset to fine-tune Gemini model.
- Fine-Tuning Status Monitoring: API endpoint for polling status of Gemini model's fine-tuning job.

## Style Guidelines:

- Primary color: Orange (#FF6B00) to reflect the theme and create a sense of energy.
- Background color: Light orange (#FFE3D1), providing a bright yet soft backdrop. (#FFE3D1 is approximately 20% saturation of #FF6B00)
- Accent color: Red-orange (#FF4500) for focus, 30 degrees 'left' of primary, creating contrast through brightness/saturation.
- Body and headline font: 'PT Sans', a humanist sans-serif offering a blend of modernity and approachability.
- Flat modern UI with clean spacing and soft shadows for a contemporary feel.
- Minimal icons that complement the orange and white theme.
- Subtle animations for real-time translation updates to enhance user experience.