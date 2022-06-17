import { ObjectID } from '../../../data/LevelDataTypes';

export const colors = {
	white: [255, 255, 255],
	gray: [127, 127, 127],
	red: [255, 0, 0],
	blue: [0, 0, 255],
	lightblue: [173, 216, 230],
	black: [0, 0, 0],
	orange: [255, 165, 0],
	yellow: [255, 255, 0],
	brown: [165, 42, 42],
	green: [0, 100, 0],
	lime: [0, 255, 0],
	purple: [230, 230, 250],
	pink: [255, 192, 203],
};

export function getObjectColor(objectName: keyof typeof ObjectID) {
	switch (objectName) {
	case 'Angry Sun':
		return colors.orange;
	case 'Ant Trooper':
		return colors.blue;
	case 'Arrow':
		return null;
	case 'Banzai Bill':
		return colors.black;
	case 'Big Coin':
		return colors.yellow;
	case 'Big Mushroom':
		return colors.red;
	case 'Blinking Block':
		return colors.red;
	case 'Block':
		return colors.brown;
	case 'Blooper':
		return colors.white;
	case 'Bob Omb':
		return colors.black;
	case 'Boo':
		return colors.white;
	case 'Boom Boom':
		return colors.orange;
	case 'Bowser':
		return colors.green;
	case 'Bowser Jr':
		return colors.green;
	case 'Bridge':
		return colors.brown;
	case 'Bullet Bill Blaster':
		return colors.black;
	case 'Bullet Bill Mask':
		return colors.black;
	case 'Bully':
		return colors.purple;
	case 'Burner':
		return colors.gray;
	case 'Buzzy Beetle':
		return colors.purple;
	case 'Cannon':
		return colors.black;
	case 'Cannon Box':
		return colors.black;
	case 'Castle Bridge':
		return colors.red;
	case 'Charvaargh':
		return colors.orange;
	case 'Checkpoint Flag':
		return colors.black;
	case 'Cheep Cheep':
		return colors.red;
	case 'Cinobic':
		return colors.red;
	case 'Cinobio':
		return colors.red;
	case 'Clear Pipe':
		return colors.lightblue;
	case 'Cloud':
		return colors.white;
	case 'Clown Car':
		return colors.white;
	case 'Coin':
		return colors.yellow;
	case 'Conveyor Belt':
		return null;
	case 'Crate':
		return colors.brown;
	case 'Donut':
		return colors.yellow;
	case 'Donut Block':
		return colors.yellow;
	case 'Door':
		return colors.brown;
	case 'Dotted Line Block':
		return colors.red;
	case 'Dry Bones':
		return colors.white;
	case 'Exclamation Block':
		return colors.yellow;
	case 'Fast Conveyor Belt':
		return null;
	case 'Fire Bar':
		return colors.gray;
	case 'Fire Flower':
		return colors.orange;
	case 'Fish Bone':
		return colors.white;
	case 'Goal':
		return colors.lime;
	case 'Goal Ground':
		return colors.brown;
	case 'Goomba':
		return colors.brown;
	case 'Goomba Mask':
		return colors.brown;
	case 'Ground':
		return colors.brown;
	case 'Half Collision Platform':
		return colors.gray;
	case 'Hammer Bro':
		return colors.green;
	case 'Hard Block':
		return colors.gray;
	case 'Hidden Block':
		return null;
	case 'Ice Block':
		return colors.lightblue;
	case 'Icicle':
		return colors.blue;
	case 'Iggy':
		return colors.orange;
	case 'Jumping Machine':
		return colors.green;
	case 'Key':
		return colors.yellow;
	case 'Koopa':
		return colors.lime;
	case 'Koopa Car':
		return colors.green;
	case 'Lakitu':
		return colors.white;
	case 'Lakitu Cloud':
		return colors.white;
	case 'Larry':
		return colors.orange;
	case 'Lava Bubble':
		return colors.orange;
	case 'Lava Lift':
		return colors.white;
	case 'Lemmy':
		return colors.orange;
	case 'Lift':
		return colors.orange;
	case 'Ludwig':
		return colors.orange;
	case 'Magikoopa':
		return colors.purple;
	case 'Mechakoopa':
		return colors.green;
	case 'Monty Mole':
		return colors.brown;
	case 'Morton':
		return colors.orange;
	case 'Muncher':
		return colors.black;
	case 'Mushroom Platform':
		return colors.orange;
	case 'Mushroom Trampoline':
		return colors.orange;
	case 'Note Block':
		return colors.pink;
	case 'On Off Block':
		return colors.red;
	case 'On Off Trampoline':
		return colors.gray;
	case 'One Up':
		return colors.lime;
	case 'One Way':
		return colors.gray;
	case 'P Block':
		return colors.orange;
	case 'P Switch':
		return colors.blue;
	case 'POW':
		return colors.blue;
	case 'Pipe':
		return colors.green;
	case 'Piranha Creeper':
		return colors.green;
	case 'Piranha Flower':
		return colors.green;
	case 'Player':
		return null;
	case 'Pokey':
		return colors.yellow;
	case 'Porkupuffer':
		return colors.purple;
	case 'Propeller Box':
		return colors.red;
	case 'Question Block':
		return colors.yellow;
	case 'Red Coin':
		return colors.red;
	case 'Red POW Box':
		return colors.red;
	case 'Reel Camera':
		return null;
	case 'Rocky Wrench':
		return colors.brown;
	case 'Roy':
		return colors.orange;
	case 'Saw':
		return colors.gray;
	case 'Seesaw':
		return colors.orange;
	case 'Semisolid Platform':
		return null;
	case 'Shoe Goomba':
		return colors.green;
	case 'Skewer':
		return colors.gray;
	case 'Skipsqueak':
		return colors.white;
	case 'Slight Slope':
		return null;
	case 'Smb2 Mushroom':
		return colors.red;
	case 'Snake Block':
		return colors.green;
	case 'Sound Effect':
		return null;
	case 'Spike Ball':
		return colors.blue;
	case 'Spike Block':
		return colors.yellow;
	case 'Spike Top':
		return colors.orange;
	case 'Spikes':
		return colors.gray;
	case 'Spiny':
		return colors.orange;
	case 'Spring':
		return colors.green;
	case 'Sprint Platform':
		return colors.orange;
	case 'Starting Arrow':
		return null;
	case 'Starting Brick':
		return colors.gray;
	case 'Steep Slope':
		return null;
	case 'Stingby':
		return colors.yellow;
	case 'Stone':
		return colors.gray;
	case 'Super Hammer':
		return colors.black;
	case 'Super Mushroom':
		return colors.red;
	case 'Super Star':
		return colors.yellow;
	case 'Swinging Claw':
		return colors.orange;
	case 'Thwomp':
		return colors.gray;
	case 'Track':
		return colors.gray;
	case 'Track Block':
		return colors.red;
	case 'Tree':
		return colors.green;
	case 'Twister':
		return colors.white;
	case 'Vine':
		return colors.green;
	case 'Warp Box':
		return colors.orange;
	case 'Water Marker':
		return null;
	case 'Wendy':
		return colors.orange;
	case 'Wiggler':
		return colors.yellow;
	default:
		return null;
	}
}
