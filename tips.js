/* Find Your Spot: coaching tips.
 * ROLE_TIPS[role][third][phase] = three short tips.
 * third: D = ball near our goal, M = middle of the field, A = ball near their goal
 * phase: att = we have the ball, def = they have the ball, loose = nobody has it
 */
(function (root) {
  'use strict';

  const ROLE_NAMES = {
    GK: 'Goalkeeper', CB: 'Center back', FB: 'Outside back', CM: 'Center midfielder', WM: 'Wide midfielder / winger', FW: 'Forward',
  };

  const ROLE_TIPS = {
    GK: {
      D: {
        att:   ['Look for a teammate who is open out wide, not in the middle.', 'Roll it or pass it on the ground when you can. It is easier to control.', 'If nobody is open, kick it high and wide, away from your goal.'],
        def:   ['Stand on the line between the ball and the middle of your goal.', 'Stay low, on your toes, hands ready.', 'Shout names so your defenders know who to mark.'],
        loose: ['If you can get there first, come out fast and grab it.', 'If you cannot win it, stay home and get set.', 'Yell "Keeper!" loud so teammates move out of your way.'],
      },
      M: {
        att:   ['Step up to the top of your box.', 'Be an easy back pass. Stand where your defenders can see you.', 'Keep talking. Tell teammates where the space is.'],
        def:   ['Move up to near the penalty spot so long balls do not get behind you.', 'Watch the forward who is furthest forward.', 'Tell your back line to stay together.'],
        loose: ['Be ready to sprint out for a ball kicked over your defenders.', 'Stay on the line between ball and goal.', 'Decide early and shout it: "Keeper!" or "Away!"'],
      },
      A: {
        att:   ['Come out to the edge of your box or a bit past it.', 'You are the last player. Be ready to sweep up a long ball.', 'Tell your defenders to push up the field.'],
        def:   ['Stay near the top of your box. The ball can come back fast.', 'Watch their fastest forward.', 'Shout "Get back!" if teammates are slow to return.'],
        loose: ['Stay up and alert. A loose ball can turn into a fast attack.', 'Line up with the ball and your goal.', 'Keep your defenders talking and organized.'],
      },
    },
    CB: {
      D: {
        att:   ['Move away from the ball and open up wide so the keeper can pass to you.', 'Look up before the ball comes. Know where you will pass.', 'If you are pressured, play it safe and wide. Never across your own goal.'],
        def:   ['Stay between your player and the goal.', 'Do not dive in. Stay on your feet and slow them down.', 'Clear it high and wide if you are in trouble.'],
        loose: ['Get to the ball first if you can and kick it away from your goal.', 'If a teammate is going, cover behind them.', 'Never let the ball bounce in your box. Attack it.'],
      },
      M: {
        att:   ['Stay behind the ball so you can get it back if we lose it.', 'Give a safe passing option behind your midfielders.', 'Talk to the other defenders. Move up together.'],
        def:   ['Keep the back line straight with the other defenders.', 'Stay closer to your goal than the forward you are marking.', 'Watch for balls kicked over your head. Turn and run with them.'],
        loose: ['Step up and win it if it is coming to you.', 'If it is not yours, drop and cover the space behind.', 'Shout "Mine!" or "Yours!" so nobody bumps into each other.'],
      },
      A: {
        att:   ['Move up to around the halfway line so the team stays close together.', 'Stay goal side of their forwards in case we lose it.', 'Win headers and passes that come back out and keep the attack going.'],
        def:   ['Get back fast. Run toward your own goal first, then look.', 'Pick up their most dangerous forward.', 'Slow the attack down so teammates can get back.'],
        loose: ['If it bounces out to you, keep it in their half.', 'Do not let a forward get behind you.', 'Stay level with the other defenders.'],
      },
    },
    FB: {
      D: {
        att:   ['Get wide, close to the sideline, so you are easy to find.', 'Check over your shoulder before the ball arrives.', 'Pass forward up the line or back to the keeper. Do not try to dribble out of your box.'],
        def:   ['If the ball is on your side, close down the attacker. Show them the sideline.', 'If the ball is on the other side, slide in toward the middle to help.', 'Watch the runner behind you. Do not just watch the ball.'],
        loose: ['If it is on your side, get there first and kick it up the line.', 'If it is far away, tuck in toward the middle.', 'Keep your body between the ball and your goal.'],
      },
      M: {
        att:   ['Stay wide to stretch the other team.', 'Move up the sideline when your winger cuts inside.', 'Make a safe pass if you are not sure. Keep the ball.'],
        def:   ['Stay in line with your center backs.', 'Guard the winger on your side. Stay goal side.', 'If the ball is far away, tuck in to make the team narrow.'],
        loose: ['Win it if it is on your side and you are closest.', 'If not, drop back level with the other defenders.', 'Talk: "Mine!" or "Away!"'],
      },
      A: {
        att:   ['Overlap: run past your winger on the outside.', 'Cross the ball in front of the goal if you get to the end.', 'If you go forward, someone must cover your spot. Check.'],
        def:   ['Sprint back to your spot first. Then find your player.', 'Stop the winger from running behind you.', 'Help slow them down. Do not let them go straight through.'],
        loose: ['Keep the ball in their half if it comes to you.', 'Stay wide but be ready to recover.', 'Watch for their winger running behind.'],
      },
    },
    CM: {
      D: {
        att:   ['Show for the ball. Move into a space where the keeper or defenders can see you.', 'Before the ball comes, look over your shoulder.', 'Turn and pass forward if you can. Pass back or wide if you cannot.'],
        def:   ['Get back in front of your defenders. Protect the middle.', 'Block passes into the middle of your box.', 'Mark the player who runs late into your box.'],
        loose: ['Win the second ball. It often falls in the middle.', 'Get it out wide and away from danger.', 'If you cannot win it, get goal side.'],
      },
      M: {
        att:   ['Keep moving to make a triangle with two teammates.', 'Switch the play to the other side when it gets crowded.', 'Look forward first. Pass to the forwards when you can.'],
        def:   ['Stay between the ball and your goal.', 'Close down the player with the ball, but do not get beaten easily.', 'Keep the middle closed. Make them go wide.'],
        loose: ['This is your ball to win. Be first to it.', 'If a teammate goes, cover behind them.', 'After you win it, look up before you pass.'],
      },
      A: {
        att:   ['Arrive late at the edge of the box for passes coming back out.', 'Shoot if you have space. Keepers make mistakes.', 'Stay in front of your defenders so the team is connected.'],
        def:   ['Press right away when we lose the ball. Win it back near their goal.', 'Block the pass into the middle.', 'If they get past, sprint back goal side.'],
        loose: ['Be first to the loose ball. Shoot or pass right away.', 'Stay near the edge of the box for the rebound.', 'Do not let them clear it easily. Get in the way.'],
      },
    },
    WM: {
      D: {
        att:   ['Get wide and up the sideline so we have an outlet.', 'Face forward when you get the ball if you can.', 'Run past their outside back if they are close to you.'],
        def:   ['Track back with the player who is running on your side.', 'Help your outside back. Make it two against one.', 'Do not stand still. Get back and help.'],
        loose: ['Get to balls near your sideline first.', 'Be ready to break forward if we win it.', 'If they win it, get goal side right away.'],
      },
      M: {
        att:   ['Stay wide to stretch the field.', 'Check toward the ball, then spin and run behind.', 'Take on your player one-on-one when you have space.'],
        def:   ['Get back level with the midfield line.', 'If the ball is on the other side, move in toward the middle.', 'Make the player with the ball go toward the sideline.'],
        loose: ['If it is near your sideline, be first.', 'If it is far, get into a spot to counterattack.', 'Do not drift too far from your side.'],
      },
      A: {
        att:   ['Get to the end of the field and cross, or cut inside and shoot.', 'If the ball is on the other side, run to the far post.', 'Be ready for crosses and rebounds.'],
        def:   ['Press their outside back right away.', 'Stop the pass down the sideline.', 'If they get past, chase back hard.'],
        loose: ['Be first to the ball at the edge of the box.', 'Shoot or cross quickly. Defenders are not set.', 'Get in front of the defender.'],
      },
    },
    FW: {
      D: {
        att:   ['Stay high near the halfway line. Give a target for a long pass.', 'Check back toward the ball to give an easy pass.', 'Turn and run at the goal if you get it with space.'],
        def:   ['Stay up near the halfway line, ready for a counterattack.', 'Block the pass back to their defenders.', 'Do not run all the way back unless the coach asks.'],
        loose: ['Be ready to run forward if we win it.', 'Stay onside. Watch their last defender.', 'Find space away from the crowd.'],
      },
      M: {
        att:   ['Run behind their defenders when a teammate can pass.', 'Stay onside. Be level with the last defender before the pass.', 'Hold the ball up and wait for help if you cannot turn.'],
        def:   ['Press their defenders. Make them kick it fast.', 'Block the easy pass to the middle.', 'Stay between the ball and their keeper so they cannot pass back.'],
        loose: ['Get in front of the defender to win it.', 'If you win it, go straight at the goal.', 'If they win it, press right away.'],
      },
      A: {
        att:   ['Get in the box. Goals come from inside it.', 'Go to the near post or the far post for crosses.', 'Follow every shot in for a rebound.'],
        def:   ['Press the defender with the ball. Make them rush.', 'Block the pass back to the keeper.', 'Win it back close to their goal.'],
        loose: ['Be the first one to the ball in the box.', 'Shoot first time if you can.', 'Expect rebounds off the keeper.'],
      },
    },
  };

  const PHASE_LABEL = { att: 'We have the ball', def: 'They have the ball', loose: 'Loose ball' };
  const THIRD_LABEL = { D: 'near our goal', M: 'in the middle', A: 'near their goal' };

  // Jobs. Each has a title and three tips. Shown for set pieces and special open play jobs.
  const JOBS = {
    gk:          { title: 'Goalkeeper' },
    shape:       { title: 'Hold your spot' },
    onBall:      { title: 'You have the ball', tips: ['Look up first.', 'Pass to an open teammate, dribble into space, or shoot.', 'Keep your body between the defender and the ball.'] },
    support:     { title: 'Be the helper', tips: ['Stand at an angle so there is a clear passing lane.', 'Not too close, not too far. About two big steps from a defender.', 'Call for it: "Here!"'] },
    press:       { title: 'Pressure the ball', tips: ['Run at the player with the ball, then slow down when you get close.', 'Stand between the ball and your goal.', 'Make them go toward the sideline.'] },
    cover:       { title: 'Cover your teammate', tips: ['Stand behind the teammate who is pressing.', 'If the attacker gets past, you are next.', 'Talk: "I got your back!"'] },
    win:         { title: 'Win the loose ball', tips: ['Be first. Run hard.', 'Get your body in front of the other player.', 'Once you win it, look up.'] },
    gkUp:        { title: 'Keeper: step up', tips: ['Move up toward the edge of your box or farther.', 'Watch for a fast counterattack.', 'Keep your defenders organized.'] },
    cornerTaker: { title: 'Take the corner', tips: ['Put the ball in the arc and look at your teammates first.', 'Aim for the space between the keeper and the penalty spot.', 'If it is crowded, play a short pass instead.'] },
    nearPost:    { title: 'Near post run', tips: ['Start a few steps out and run to the near post as the ball is kicked.', 'Flick it on or redirect it toward goal.', 'Get in front of your defender.'] },
    farPost:     { title: 'Far post', tips: ['Wait at the back post for balls that go over everyone.', 'Stay ready. Many corners end up here.', 'Head or kick it back across the goal.'] },
    penSpot:     { title: 'Penalty spot', tips: ['Attack the ball in the middle of the box.', 'Move just before the kick so your defender loses you.', 'Head it down toward the goal.'] },
    sixCenter:   { title: 'Front of the keeper', tips: ['Stand near the keeper and get in their way (fairly).', 'Be ready for a dropped ball.', 'Do not push or hold. That is a foul.'] },
    farBack:     { title: 'Wide back post', tips: ['Stay wide on the far side of the box.', 'Collect balls that go long and cross them back in.', 'Keep the play alive.'] },
    short:       { title: 'Short corner option', tips: ['Stand near the corner so the taker has an easy pass.', 'If you get it, cross it or dribble toward goal.', 'Use it if the box is crowded.'] },
    edge:        { title: 'Edge of the box', tips: ['Wait at the edge for clearances.', 'Shoot first time or keep the ball in their half.', 'If they win it, delay their counterattack.'] },
    restD:       { title: 'Stay back', tips: ['You stay back in case they clear it and counterattack.', 'Mark their forward who stayed up.', 'Stay goal side and keep talking.'] },
    counter:     { title: 'Stay up for the counter', tips: ['Stay up the field ready to run if we clear it.', 'Make their defenders stay back to watch you.', 'Be ready to hold the ball and wait for help.'] },
    gkCorner:    { title: 'Keeper on a corner', tips: ['Stand in the middle of your goal, a little toward the far post.', 'Come out and catch the ball if you can reach it. Shout "Keeper!"', 'If you cannot catch it, punch it high and wide.'] },
    nearZone:    { title: 'Guard the near post area', tips: ['Attack the first ball that comes in.', 'Head or kick it high, far and wide.', 'Do not let anyone get in front of you.'] },
    sixZone:     { title: 'Protect the six yard box', tips: ['You are in front of the keeper. Win anything in the air.', 'Clear the ball away from the middle.', 'Do not block your keeper. Listen for "Keeper!"'] },
    farZone:     { title: 'Guard the far post area', tips: ['Watch for balls that go over everyone.', 'Clear it wide, not across the goal.', 'Keep an eye on the runner behind you.'] },
    penZone:     { title: 'Guard the penalty spot', tips: ['Win the ball in the middle of the box.', 'Mark the big player who goes there.', 'Clear high and wide.'] },
    edgeD:       { title: 'Win the second ball', tips: ['Stand at the edge of the box for balls that get cleared.', 'Win it and get it wide or up the field.', 'Block shots from the edge.'] },
    postGuard:   { title: 'Stand on the post', tips: ['Stand just inside the near post.', 'Clear any ball going inside the post.', 'Stay until the keeper tells you to go.'] },
    shortCorner: { title: 'Stop the short corner', tips: ['Stand back the right distance from the ball.', 'If they pass it short, close them down fast.', 'Block the cross if you can.'] },
    farEdge:     { title: 'Far edge of the box', tips: ['Watch for players arriving late.', 'Win the second ball.', 'Push out with the team after we clear it.'] },
    wall:        { title: 'Be in the wall', tips: ['Stand shoulder to shoulder. No gaps.', 'Protect yourself, then stay strong. Do not turn your back.', 'After the kick, react to the rebound.'] },
    gkFk:        { title: 'Keeper on a free kick', tips: ['Set the wall to cover your near post.', 'Stand a little toward the far post side so you can see the ball.', 'Stay on your toes. Be ready for a shot or a cross.'] },
    holdLine:    { title: 'Hold the line', tips: ['Stand in a straight line with the other defenders.', 'Mark the attacker near you. Stay goal side.', 'Step up together when the ball is cleared.'] },
    secondBall:  { title: 'Watch the rebound', tips: ['Stand away from the wall to catch balls that bounce out.', 'Mark players who run late.', 'Clear it wide if it comes to you.'] },
    fkTaker:     { title: 'Take the free kick', tips: ['Look before you kick. Where is the space?', 'If close to goal, aim around or over the wall.', 'If far away, a fast pass to an open teammate is great.'] },
    fkDummy:     { title: 'Stand by the ball', tips: ['Stand next to the ball to make the defense guess.', 'You can run over the ball as a fake.', 'Be ready for a short pass.'] },
    attackLine:  { title: 'Attack the ball', tips: ['Line up with their defenders so you are onside.', 'Time your run. Go when the ball is kicked.', 'Follow every shot in.'] },
    gkKick:      { title: 'Take the goal kick', tips: ['Look for a defender who is open at the edge of the box.', 'A short pass is fine if they are open.', 'If everyone is covered, kick it long and wide.'] },
    splitWide:   { title: 'Split wide', tips: ['Get wide near the corner of the penalty box.', 'Face up the field so you can see options.', 'If pressured, pass back to the keeper or up the sideline.'] },
    showCenter:  { title: 'Show in the middle', tips: ['Stand at the top of the box as a passing option.', 'Only take it if you have time to turn.', 'Never lose it in the middle near your goal.'] },
    fbHigh:      { title: 'Get high and wide', tips: ['Stand wide near the sideline, up the field.', 'You are the next pass after the defender.', 'Face forward when you receive.'] },
    showForBall: { title: 'Show for the ball', tips: ['Drop in front of your defenders to give a passing option.', 'Look over your shoulder first.', 'Pass it back if you cannot turn safely.'] },
    pressHigh:   { title: 'Press the goal kick', tips: ['Stand near the edge of their box.', 'Press the player who gets the ball.', 'Block the pass to the middle.'] },
    buildOut:    { title: 'Behind the build-out line', tips: ['In 7v7 and 9v9 many leagues have a build-out line. Stay behind it until the ball is played.', 'Once they pass it, you can press.', 'Rules vary. Ask your coach what your league does.'] },
    kicker:      { title: 'Take the kickoff', tips: ['The ball can go any direction. Look for your passing teammate.', 'You cannot touch it twice before someone else does.', 'Stay in your half until you kick.'] },
    koReceiver:  { title: 'Receive the kickoff', tips: ['Stand a few steps away to get the first pass.', 'Have a plan: pass wide or switch it.', 'Keep it. Do not just kick it away.'] },
    koRun:       { title: 'Ready to run', tips: ['Stand on the halfway line in your own half.', 'Sprint forward as soon as the ball is kicked.', 'Stay onside.'] },
    koPress:     { title: 'Pressure their kickoff', tips: ['Stay out of the center circle until the ball is kicked.', 'Then pressure the ball fast.', 'Block the easy pass back.'] },
    koShape:     { title: 'Kickoff spot', tips: ['Stay in your own half until the ball is kicked.', 'Be in your normal spot in the formation.', 'Be ready to move as soon as the ball does.'] },
  };

  const API = { ROLE_NAMES, ROLE_TIPS, PHASE_LABEL, THIRD_LABEL, JOBS };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else root.FYS_TIPS = API;
})(typeof window !== 'undefined' ? window : globalThis);
