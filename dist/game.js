//////////////////////////////////////////////////////////////
// EASY-MODIFY SECTION
// UPDATE VALUES IN THIS SECTION TO EASILY MODIFY GAME

// Constants for roaster names and sprite URLs
const BATTLER_1_NAME = 'Mass';
const BATTLER_1_SPRITE_URL = '/assets/Mass.png?flZh';

const BATTLER_2_NAME = 'Jass';
const BATTLER_2_SPRITE_URL = '/assets/Jass.png?KE4P';

// END OF EASY-MODIFY VALUES
//////////////////////////////////////////////////////////////

class Battler {
    constructor(name, spriteURL) {
        this.name = name;
        this.spriteURL = spriteURL;
        this.health = 100;
    }
}

// Create fighter instances
const battler1 = new Battler(BATTLER_1_NAME, BATTLER_1_SPRITE_URL);
const battler2 = new Battler(BATTLER_2_NAME, BATTLER_2_SPRITE_URL);

class RoastScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'RoastScene'
        });
        this.roastHistory = []; // History of the roast battle
        this.footage_mode = false; // Toggle for footage mode, default is false
        this.isMessageShowing = false; // Flag to indicate if a message is being shown
        this.currentTurn = 0; // 0 for battler1, 1 for battler2
    }

    preload() {
        this.load.image('stage_bg', '/assets/bg_02_prod.png');
        this.load.image('style_overlay', https://github.com/Rinellasky/MassVersusJass_LethalLips/blob/main/dist/assets/bg_02_style_tint_ovelay_prod.png');
        this.load.image(battler1.name, battler1.spriteURL);
        this.load.image(battler2.name, battler2.spriteURL);

        // Load custom font
        this.load.bitmapFont('monocraft', '/assets/monocraft.png', '/assets/monocraft.xml');
        // Load music tracks
        this.load.audio('music1', '/assets/04-Ingame-Rock2-loop.mp3?c0Uu');
        this.load.audio('music2', '/assets/05-Ingame-Rock3-loop.mp3?5YQe');
        this.load.audio('music3', '/assets/06-Ingame-PowerMetal-loop.mp3?aQ0E');
        this.load.audio('music4', '/assets/07-Ingame-ElectroMetal-loop.mp3?QlOn');
        this.load.audio('lowHealthMusic', '/assets/08-Ingame-BlackMetal-AlvaMajo-loop.mp3?dYmx');
    }

    async create() {
        this.add.image(640, 360, 'stage_bg');

        // Add style overlay
        this.add.image(640, 360, 'style_overlay').setDepth(3);
        // Add fighter sprites
        this.battler1Sprite = this.add.image(455, 525, battler1.name).setScale(0.6).setDepth(2);
        this.battler2Sprite = this.add.image(835, 535, battler2.name).setScale(0.6).setDepth(2);
        // this.battler2Sprite.flipX = true;

        // Initialize health bars
        this.createHealthBars();

        // Create dialog text object
        this.dialogTextBg = this.add.rectangle(640, 660, 1300, 40, 0x000000).setOrigin(0.5, 0.5).setAlpha(0.40).setDepth(3);
        this.dialogText = this.add.text(640, 655, '', {
            fontFamily: 'Monocraft',
            fontSize: '18px',
            color: '#ffffff',
            align: 'center',
        }).setDepth(3);
        this.dialogText.setOrigin(0.5, 0.5);
        this.dialogText.alpha = 0; // Start invisible

        // Add idle breathing animation
        this.addIdleAnimation(this.battler1Sprite);
        this.addIdleAnimation(this.battler2Sprite);

        // Create the battle simulator AI
        this.roastBattleSimulator = new ChatManager(this.getRoastBattleSimulatorDescription());

        // Create the battle severity judge AI
        this.roastSeverityJudge = new ChatManager(this.getRoastSeverityJudgeDescription());

        if (!this.footage_mode) {
            this.startBackgroundMusic();
        }

        // Start the battle loop
        this.startBattleLoop();
    }

    getRoastBattleSimulatorDescription() {
        return `
        You are the master of verbal destruction in an AI-powered roast battle game. Your goal is to craft insults so savage and creative they'll leave your opponent's ego in tatters.

        Game Mechanics (PAY CLOSE ATTENTION):
        - This is a turn-based roast battle between two characters: ${battler1.name} and ${battler2.name}.
        - You will ONLY generate roasts for the character whose turn it is.
        - The 'speaking_character' in your output MUST ALWAYS be the character whose turn it is to roast.
        - NEVER generate roasts for both characters or the wrong character.

        Your Cruel Task:
        Generate the next set of brutal, witty, and CLEARLY character-specific insults for the current speaker ONLY.

        Output Format (FOLLOW THIS EXACTLY):
        {
            "speaking_character": "[ONLY the name of the character whose turn it is]",
            "roast": {
                "line_01": "[First verbal dagger]",
                "line_02": "[Twist the knife]",
                "line_03": "[Go for the kill]",
            }
        }

        Rules of Engagement:
        1. Savagery Scale: Deliver 3 lines of pure verbal venom. Vary the number for unpredictability.
        2. Precision Strikes: Each line must be a tactical nuke of 12 words or less.
        3. Stay in Character: Channel the speaker's unique voice and background for authentic savagery.
        4. Creative Cruelty: Craft bespoke brutality. Generic insults are for amateurs.
        5. Psychological Warfare: Set up your victim, then go for the jugular. Exploit weaknesses.
        6. Fluid Ferocity: Your lines should flow seamlessly, each building on the last.
        7. Callback Carnage: Reference previous roasts when possible to create ongoing devastation.
        8. No-Holds-Barred: Political correctness is dead. Push boundaries, but stay in character.
        9. Originality is King: Innovate or evaporate. Clichés are the refuge of the weak.
        10. Context is Crucial: Use the battlers' traits and history as ammunition.

        CRITICAL REMINDERS:
        - CHARACTER SHOULD ONLY SAY THINGS THAT THEY'RE CHARACTER WOULD SAY
        - ALWAYS check which character is speaking before generating the roast.
        - NEVER switch characters mid-roast or generate for the wrong character.
        - Your JSON must be flawless. A parsing error could break the entire battle.
        - Repetition is death. Each line should be a unique dagger to the soul that ONLY that character would say.
        - This isn't just a roast; it's psychological warfare. Leave your opponent questioning their life choices.

        Now go forth and reduce your opponent to a quivering mass of insecurities and regret!
        `;
    }

    getRoastSeverityJudgeDescription() {
        return `
        You are a roast severity judge for an AI-powered roast session game. 

        The game works by battlers roasting the other battler in-character.

        A separate system will generate roasts for you to judge.

        Your job is to respond with one of the following: 0, 1, OR 2.

        0 is for if the roast is cliche, standard, or expected.
        1 is for if the roast is clever and hard-hitting.
        2 is for if the roast is clever, scathing, and extremely hard-hitting.


        INFO TO GUIDE YOUR RESPONSES:
        - Make sure to give accurate ratings. 

        - Only give 1 ratings if the roast is clearly above average.

        - Only give "2" ratings if the roast is CLEARLY amazing. 2s should be hard to earn since they deal so much damage.

        - REMEMBER: Battler 1 is ${battler1.name}. Battler 2 is ${battler2.name}.
        `;
    }

    startBackgroundMusic() {
        this.sound.volume = 0.05; // Set initial volume

        const musicTracks = ['music1', 'music2', 'music3', 'music4'];
        const lowHealthMusic = 'lowHealthMusic';

        this.music = this.sound.add(Phaser.Math.RND.pick(musicTracks), {
            loop: true
        });

        this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                const fighters = [battler1, battler2];
                if (fighters.some(f => f.health <= 30)) {
                    if (this.music.key !== lowHealthMusic) {
                        this.music.stop();
                        this.music = this.sound.add(lowHealthMusic, {
                            loop: true
                        });
                        this.music.play();
                    }
                } else if (!this.musicPlaying) {
                    this.music.stop();
                    this.music = this.sound.add(Phaser.Math.RND.pick(musicTracks), {
                        loop: true
                    });
                    this.music.play();
                    this.musicPlaying = true;
                }
            }
        });

        this.music.on('complete', () => {
            this.music.stop();
            this.music = this.sound.add(Phaser.Math.RND.pick(musicTracks), {
                loop: true
            });
            this.music.play();
        });
    }

    createHealthBars() {
        // Fighter 1 health bar
        this.battler1HealthBarBg = this.add.rectangle(140, 80, 420, 50, 0x000000).setOrigin(0, 0.5).setDepth(100);
        this.battler1HealthBar = this.add.rectangle(150, 80, 400, 30, 0x00ff00).setOrigin(0, 0.5).setDepth(100);
        this.battler1NameText = this.add.bitmapText(150, 30, 'monocraft', battler1.name, 25).setOrigin(0, 0.5).setDepth(100);

        // Fighter 2 health bar
        this.battler2HealthBarBg = this.add.rectangle(1140, 80, 420, 50, 0x000000).setOrigin(1, 0.5).setDepth(100);
        this.battler2HealthBar = this.add.rectangle(1130, 80, 400, 30, 0x00ff00).setOrigin(1, 0.5).setDepth(100);
        this.battler2NameText = this.add.bitmapText(1130, 30, 'monocraft', battler2.name, 25).setOrigin(1, 0.5).setDepth(100);

        // Store references to health bars for easy access
        this.updateHealthBars();
    }

    updateHealthBars() {
        this.updateHealthBar(this.battler1HealthBar, battler1.health);
        this.updateHealthBar(this.battler2HealthBar, battler2.health);
    }

    updateHealthBar(healthBar, health) {
        const healthPercent = Math.max(health / 100, 0); // Ensure health doesn't go negative
        const maxHealthBarWidth = 400; // Match the actual max width of health bars
        const healthBarWidth = maxHealthBarWidth * healthPercent;

        healthBar.width = healthBarWidth;

        if (healthPercent > 0.5) {
            healthBar.fillColor = 0x00ff00; // Green
        } else if (healthPercent > 0.25) {
            healthBar.fillColor = 0xffff00; // Yellow
        } else if (healthPercent > 0.1) {
            healthBar.fillColor = 0xffa500; // Orange
        } else {
            healthBar.fillColor = 0xff0000; // Red
        }
    }

    async startBattleLoop() {
        console.log('Running battle loop iteration...');
        console.log(`${battler1.name} health: ${battler1.health}`);
        console.log(`${battler2.name} health: ${battler2.health}`);
        let nextRoast = null;
        while (true) {
            try {
                if (nextRoast) {
                    await this.displayRoast(nextRoast);
                }

                nextRoast = this.roastHandler();

                if (this.checkWinner(battler1, battler2)) {
                    break;
                }
                await this.delay(3000); // 3-second delay before next round
            } catch (error) {
                console.error("Error handling roast:", error);
                await this.delay(1000); // Retry after 1 second if there's an error
                continue;
            }
        }
    }
    async displayRoast(roastPromise) {
        const roast = await roastPromise;
        const roastLines = Object.values(roast.roast).map(line => line.trim()).filter(line => line.length > 0);
        this.roastHistory.push(roastLines);
        for (let i = 0; i < roastLines.length; i++) {
            await this.showRoastLine(roast.speaking_character + ": " + roastLines[i]);
        }
        const severity = await this.getRoastSeverity(roastLines);
        this.updateRoasterStatus(roast.speaking_character, severity);
        this.updateHealthBars();
        if (!this.checkWinner(battler1, battler2)) {
            this.currentTurn = 1 - this.currentTurn;
        }
    }

    async roastHandler() {
        console.log('Handling roast...');
        const currentBattler = this.getCurrentSpeakingBattler();
        if (!currentBattler) {
            console.error("Error: Current speaking battler is undefined");
            return null; // Skip this turn if the current battler is undefined
        }
        const roastBattleSimulatorInput = `
            It's ${currentBattler.name}'s turn to roast.
            Please generate the lines of their next roast. There is serious beef between them.
        `;
        // Add battle simulator input to the history
        this.roastBattleSimulator.addMessage('user', roastBattleSimulatorInput);
        // Get the battle result from the battle simulator AI
        try {
            const roastResponse = await this.roastBattleSimulator.getCharacterResponse('classify');
            this.roastBattleSimulator.addMessage('assistant', roastResponse);
            console.log("Raw Roast Response:", roastResponse); // Log the raw response for debugging
            return JSON.parse(roastResponse);
        } catch (error) {
            console.error("Error getting roast from AI:", error);
            return null; // Skip this turn if there's an error
        }
    }

    showRoastLine(line) {
        return new Promise((resolve) => {
            const fadeInDuration = 750;
            const displayDuration = 8000;
            const fadeOutDuration = 750;
            this.tweens.add({
                targets: this.dialogText,
                alpha: 1,
                duration: fadeInDuration,
                onStart: () => {
                    this.dialogText.setText(line);
                    this.dialogText.setWordWrapWidth(1300); // Adjust word wrap width for more horizontal space
                },
                onComplete: () => {
                    this.time.delayedCall(displayDuration, () => {
                        this.tweens.add({
                            targets: this.dialogText,
                            alpha: 0,
                            duration: fadeOutDuration,
                            onComplete: resolve
                        });
                    });
                }
            });
        });
    }

    getCurrentSpeakingBattler() {
        return this.currentTurn === 0 ? battler1 : battler2;
    }

    async getRoastSeverity(roastLines) {
        const roastSeverityJudgeInput = `
            Please rate the severity of the following roast:
            ${roastLines.join('\n')}
        `;

        // Add roast severity judge input to the history
        this.roastSeverityJudge.addMessage('user', roastSeverityJudgeInput);

        // Get the severity rating from the severity judge AI
        let severityRating;
        try {
            severityRating = await this.roastSeverityJudge.getCharacterResponse('classify');
            this.roastSeverityJudge.addMessage('assistant', severityRating);
            console.warn(severityRating);
        } catch (error) {
            console.error("Error getting severity rating from AI:", error);
            severityRating = 0; // Default to 0 if there's an error
        }

        return parseInt(severityRating, 10);
    }

    updateRoasterStatus(battlerName, severity) {
        let damage;
        if (severity === 0) {
            damage = 10;
        } else if (severity === 1) {
            damage = 20;
        } else if (severity === 2) {
            damage = 40;
        } else {
            damage = 0; // Default to no damage if severity is invalid
        }

        if (battlerName === battler1.name) {
            battler2.health = Math.max(battler2.health - damage, 0);
            this.applyDamageEffect(this.battler2Sprite, severity);
        } else {
            battler1.health = Math.max(battler1.health - damage, 0);
            this.applyDamageEffect(this.battler1Sprite, severity);
        }
    }

    applyDamageEffect(sprite, severity) {
        let shakeIntensity;
        if (severity === 0) {
            shakeIntensity = 5;
        } else if (severity === 1) {
            shakeIntensity = 10;
        } else if (severity === 2) {
            shakeIntensity = 20;
        }

        // Apply shake effect
        this.tweens.add({
            targets: sprite,
            x: sprite.x + shakeIntensity,
            duration: 50,
            yoyo: true,
            repeat: 5,
            onStart: () => {
                sprite.setTint(0xff0000); // Turn red
            },
            onComplete: () => {
                sprite.clearTint(); // Reset color
            }
        });
    }

    checkWinner(battler1, battler2) {
        if (battler1.health <= 0 || battler2.health <= 0) {
            let winner;
            if (battler1.health <= 0) {
                winner = battler2;
                this.battler1Sprite.setAlpha(0.5); // Make the losing fighter semi-transparent
            } else {
                winner = battler1;
                this.battler2Sprite.setAlpha(0.5); // Make the losing fighter semi-transparent
            }
            console.log(`${winner.name} WINS`);
            this.showVictoryText(`${winner.name} WINS`);
            return true;
        }
        return false;
    }

    showVictoryText(text) {
        this.dialogText.setText(text);
        this.tweens.add({
            targets: this.dialogText,
            alpha: 1,
            duration: 100,
            ease: 'Power2',
            yoyo: true,
            hold: 5000, // Display for 5 seconds
            onComplete: () => {
                this.dialogText.alpha = 0;
            }
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    addIdleAnimation(sprite) {
        this.tweens.add({
            targets: sprite,
            y: '+=5',
            duration: 1000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }
}

// Example usage
const config = {
    type: Phaser.CANVAS,
    parent: 'renderDiv',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 720,
        zoom: 1, // Ensures the game is displayed at 1x scale initially
    },
    render: {
        pixelArt: true, // Enables pixel-perfect rendering
        antialias: false, // Disables anti-aliasing for crisp pixels
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 200
            }
        }
    },
    scene: RoastScene
};

const game = new Phaser.Game(config);