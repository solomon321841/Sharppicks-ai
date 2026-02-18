'use client'

import { useState } from 'react'
import Image from 'next/image'

// Mapping of Team Name -> Logo URL
// Switched to reliable ESPN/Wikipedia CDNs after 404 errors with official league assets.
const LOGO_MAP: Record<string, string> = {
    // NFL
    'Arizona Cardinals': 'https://a.espncdn.com/i/teamlogos/nfl/500/ari.png',
    'Atlanta Falcons': 'https://a.espncdn.com/i/teamlogos/nfl/500/atl.png',
    'Baltimore Ravens': 'https://a.espncdn.com/i/teamlogos/nfl/500/bal.png',
    'Buffalo Bills': 'https://a.espncdn.com/i/teamlogos/nfl/500/buf.png',
    'Carolina Panthers': 'https://a.espncdn.com/i/teamlogos/nfl/500/car.png',
    'Chicago Bears': 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png',
    'Cincinnati Bengals': 'https://a.espncdn.com/i/teamlogos/nfl/500/cin.png',
    'Cleveland Browns': 'https://a.espncdn.com/i/teamlogos/nfl/500/cle.png',
    'Dallas Cowboys': 'https://a.espncdn.com/i/teamlogos/nfl/500/dal.png',
    'Denver Broncos': 'https://a.espncdn.com/i/teamlogos/nfl/500/den.png',
    'Detroit Lions': 'https://a.espncdn.com/i/teamlogos/nfl/500/det.png',
    'Green Bay Packers': 'https://a.espncdn.com/i/teamlogos/nfl/500/gb.png',
    'Houston Texans': 'https://a.espncdn.com/i/teamlogos/nfl/500/hou.png',
    'Indianapolis Colts': 'https://a.espncdn.com/i/teamlogos/nfl/500/ind.png',
    'Jacksonville Jaguars': 'https://a.espncdn.com/i/teamlogos/nfl/500/jax.png',
    'Kansas City Chiefs': 'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png',
    'Las Vegas Raiders': 'https://a.espncdn.com/i/teamlogos/nfl/500/lv.png',
    'Los Angeles Chargers': 'https://a.espncdn.com/i/teamlogos/nfl/500/lac.png',
    'Los Angeles Rams': 'https://a.espncdn.com/i/teamlogos/nfl/500/lar.png',
    'Miami Dolphins': 'https://a.espncdn.com/i/teamlogos/nfl/500/mia.png',
    'Minnesota Vikings': 'https://a.espncdn.com/i/teamlogos/nfl/500/min.png',
    'New England Patriots': 'https://a.espncdn.com/i/teamlogos/nfl/500/ne.png',
    'New Orleans Saints': 'https://a.espncdn.com/i/teamlogos/nfl/500/no.png',
    'New York Giants': 'https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png',
    'New York Jets': 'https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png',
    'Philadelphia Eagles': 'https://a.espncdn.com/i/teamlogos/nfl/500/phi.png',
    'Pittsburgh Steelers': 'https://a.espncdn.com/i/teamlogos/nfl/500/pit.png',
    'San Francisco 49ers': 'https://a.espncdn.com/i/teamlogos/nfl/500/sf.png',
    'Seattle Seahawks': 'https://a.espncdn.com/i/teamlogos/nfl/500/sea.png',
    'Tampa Bay Buccaneers': 'https://a.espncdn.com/i/teamlogos/nfl/500/tb.png',
    'Tennessee Titans': 'https://a.espncdn.com/i/teamlogos/nfl/500/ten.png',
    'Washington Commanders': 'https://a.espncdn.com/i/teamlogos/nfl/500/wsh.png',

    // NBA
    'Atlanta Hawks': 'https://a.espncdn.com/i/teamlogos/nba/500/atl.png',
    'Boston Celtics': 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png',
    'Brooklyn Nets': 'https://a.espncdn.com/i/teamlogos/nba/500/bkn.png',
    'Charlotte Hornets': 'https://a.espncdn.com/i/teamlogos/nba/500/cha.png',
    'Chicago Bulls': 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png',
    'Cleveland Cavaliers': 'https://a.espncdn.com/i/teamlogos/nba/500/cle.png',
    'Dallas Mavericks': 'https://a.espncdn.com/i/teamlogos/nba/500/dal.png',
    'Denver Nuggets': 'https://a.espncdn.com/i/teamlogos/nba/500/den.png',
    'Detroit Pistons': 'https://a.espncdn.com/i/teamlogos/nba/500/det.png',
    'Golden State Warriors': 'https://a.espncdn.com/i/teamlogos/nba/500/gs.png',
    'Houston Rockets': 'https://a.espncdn.com/i/teamlogos/nba/500/hou.png',
    'Indiana Pacers': 'https://a.espncdn.com/i/teamlogos/nba/500/ind.png',
    'Los Angeles Clippers': 'https://a.espncdn.com/i/teamlogos/nba/500/lac.png',
    'Los Angeles Lakers': 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png',
    'Memphis Grizzlies': 'https://a.espncdn.com/i/teamlogos/nba/500/mem.png',
    'Miami Heat': 'https://a.espncdn.com/i/teamlogos/nba/500/mia.png',
    'Milwaukee Bucks': 'https://a.espncdn.com/i/teamlogos/nba/500/mil.png',
    'Minnesota Timberwolves': 'https://a.espncdn.com/i/teamlogos/nba/500/min.png',
    'New Orleans Pelicans': 'https://a.espncdn.com/i/teamlogos/nba/500/no.png',
    'New York Knicks': 'https://a.espncdn.com/i/teamlogos/nba/500/ny.png',
    'Oklahoma City Thunder': 'https://a.espncdn.com/i/teamlogos/nba/500/okc.png',
    'Orlando Magic': 'https://a.espncdn.com/i/teamlogos/nba/500/orl.png',
    'Philadelphia 76ers': 'https://a.espncdn.com/i/teamlogos/nba/500/phi.png',
    'Phoenix Suns': 'https://a.espncdn.com/i/teamlogos/nba/500/phx.png',
    'Portland Trail Blazers': 'https://a.espncdn.com/i/teamlogos/nba/500/por.png',
    'Sacramento Kings': 'https://a.espncdn.com/i/teamlogos/nba/500/sac.png',
    'San Antonio Spurs': 'https://a.espncdn.com/i/teamlogos/nba/500/sas.png',
    'Toronto Raptors': 'https://a.espncdn.com/i/teamlogos/nba/500/tor.png',
    'Utah Jazz': 'https://a.espncdn.com/i/teamlogos/nba/500/utah.png',
    'Washington Wizards': 'https://a.espncdn.com/i/teamlogos/nba/500/wsh.png',

    // NHL
    'Anaheim Ducks': 'https://a.espncdn.com/i/teamlogos/nhl/500/ana.png',
    'Arizona Coyotes': 'https://a.espncdn.com/i/teamlogos/nhl/500/ari.png',
    'Boston Bruins': 'https://a.espncdn.com/i/teamlogos/nhl/500/bos.png',
    'Buffalo Sabres': 'https://a.espncdn.com/i/teamlogos/nhl/500/buf.png',
    'Calgary Flames': 'https://a.espncdn.com/i/teamlogos/nhl/500/cgy.png',
    'Carolina Hurricanes': 'https://a.espncdn.com/i/teamlogos/nhl/500/car.png',
    'Chicago Blackhawks': 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png',
    'Colorado Avalanche': 'https://a.espncdn.com/i/teamlogos/nhl/500/col.png',
    'Columbus Blue Jackets': 'https://a.espncdn.com/i/teamlogos/nhl/500/cbj.png',
    'Dallas Stars': 'https://a.espncdn.com/i/teamlogos/nhl/500/dal.png',
    'Detroit Red Wings': 'https://a.espncdn.com/i/teamlogos/nhl/500/det.png',
    'Edmonton Oilers': 'https://a.espncdn.com/i/teamlogos/nhl/500/edm.png',
    'Florida Panthers': 'https://a.espncdn.com/i/teamlogos/nhl/500/fla.png',
    'Los Angeles Kings': 'https://a.espncdn.com/i/teamlogos/nhl/500/la.png',
    'Minnesota Wild': 'https://a.espncdn.com/i/teamlogos/nhl/500/min.png',
    'Montreal Canadiens': 'https://a.espncdn.com/i/teamlogos/nhl/500/mtl.png',
    'Nashville Predators': 'https://a.espncdn.com/i/teamlogos/nhl/500/nsh.png',
    'New Jersey Devils': 'https://a.espncdn.com/i/teamlogos/nhl/500/nj.png',
    'New York Islanders': 'https://a.espncdn.com/i/teamlogos/nhl/500/nyi.png',
    'New York Rangers': 'https://a.espncdn.com/i/teamlogos/nhl/500/nyr.png',
    'Ottawa Senators': 'https://a.espncdn.com/i/teamlogos/nhl/500/ott.png',
    'Philadelphia Flyers': 'https://a.espncdn.com/i/teamlogos/nhl/500/phi.png',
    'Pittsburgh Penguins': 'https://a.espncdn.com/i/teamlogos/nhl/500/pit.png',
    'San Jose Sharks': 'https://a.espncdn.com/i/teamlogos/nhl/500/sj.png',
    'Seattle Kraken': 'https://a.espncdn.com/i/teamlogos/nhl/500/sea.png',
    'St. Louis Blues': 'https://a.espncdn.com/i/teamlogos/nhl/500/stl.png',
    'Tampa Bay Lightning': 'https://a.espncdn.com/i/teamlogos/nhl/500/tb.png',
    'Toronto Maple Leafs': 'https://a.espncdn.com/i/teamlogos/nhl/500/tor.png',
    'Vancouver Canucks': 'https://a.espncdn.com/i/teamlogos/nhl/500/van.png',
    'Vegas Golden Knights': 'https://a.espncdn.com/i/teamlogos/nhl/500/vgk.png',
    'Washington Capitals': 'https://a.espncdn.com/i/teamlogos/nhl/500/wsh.png',
    'Winnipeg Jets': 'https://a.espncdn.com/i/teamlogos/nhl/500/wpg.png',
    'Utah Hockey Club': 'https://assets.nhle.com/logos/nhl/svg/UTA_light.svg',

    // EPL
    'Arsenal': 'https://a.espncdn.com/i/teamlogos/soccer/500/359.png',
    'Aston Villa': 'https://a.espncdn.com/i/teamlogos/soccer/500/362.png',
    'Bournemouth': 'https://a.espncdn.com/i/teamlogos/soccer/500/349.png',
    'Brentford': 'https://a.espncdn.com/i/teamlogos/soccer/500/337.png',
    'Brighton & Hove Albion': 'https://a.espncdn.com/i/teamlogos/soccer/500/331.png',
    'Burnley': 'https://a.espncdn.com/i/teamlogos/soccer/500/379.png',
    'Chelsea': 'https://a.espncdn.com/i/teamlogos/soccer/500/363.png',
    'Crystal Palace': 'https://a.espncdn.com/i/teamlogos/soccer/500/384.png',
    'Everton': 'https://a.espncdn.com/i/teamlogos/soccer/500/368.png',
    'Fulham': 'https://a.espncdn.com/i/teamlogos/soccer/500/370.png',
    'Liverpool': 'https://a.espncdn.com/i/teamlogos/soccer/500/364.png',
    'Luton Town': 'https://a.espncdn.com/i/teamlogos/soccer/500/371.png',
    'Manchester City': 'https://a.espncdn.com/i/teamlogos/soccer/500/382.png',
    'Manchester United': 'https://a.espncdn.com/i/teamlogos/soccer/500/360.png',
    'Newcastle United': 'https://a.espncdn.com/i/teamlogos/soccer/500/361.png',
    'Nottingham Forest': 'https://a.espncdn.com/i/teamlogos/soccer/500/393.png',
    'Sheffield United': 'https://a.espncdn.com/i/teamlogos/soccer/500/375.png',
    'Tottenham Hotspur': 'https://a.espncdn.com/i/teamlogos/soccer/500/367.png',
    'West Ham United': 'https://a.espncdn.com/i/teamlogos/soccer/500/371.png',
    'Wolverhampton Wanderers': 'https://a.espncdn.com/i/teamlogos/soccer/500/380.png',

    // La Liga - Using ESPN IDs
    'Alavés': 'https://a.espncdn.com/i/teamlogos/soccer/500/96.png',
    'Deportivo Alavés': 'https://a.espncdn.com/i/teamlogos/soccer/500/96.png',
    'Athletic Club': 'https://a.espncdn.com/i/teamlogos/soccer/500/93.png',
    'Athletic Bilbao': 'https://a.espncdn.com/i/teamlogos/soccer/500/93.png',
    'Atlético de Madrid': 'https://a.espncdn.com/i/teamlogos/soccer/500/1068.png',
    'Atlético Madrid': 'https://a.espncdn.com/i/teamlogos/soccer/500/1068.png',
    'FC Barcelona': 'https://a.espncdn.com/i/teamlogos/soccer/500/83.png',
    'Barcelona': 'https://a.espncdn.com/i/teamlogos/soccer/500/83.png',
    'Real Betis': 'https://a.espncdn.com/i/teamlogos/soccer/500/244.png',
    'Cádiz': 'https://a.espncdn.com/i/teamlogos/soccer/500/3842.png',
    'Celta Vigo': 'https://a.espncdn.com/i/teamlogos/soccer/500/85.png',
    'Getafe': 'https://a.espncdn.com/i/teamlogos/soccer/500/2922.png',
    'Girona': 'https://a.espncdn.com/i/teamlogos/soccer/500/2996.png',
    'Granada': 'https://a.espncdn.com/i/teamlogos/soccer/500/3382.png',
    'Las Palmas': 'https://a.espncdn.com/i/teamlogos/soccer/500/98.png',
    'Mallorca': 'https://a.espncdn.com/i/teamlogos/soccer/500/84.png',
    'Osasuna': 'https://a.espncdn.com/i/teamlogos/soccer/500/97.png',
    'Rayo Vallecano': 'https://a.espncdn.com/i/teamlogos/soccer/500/101.png',
    'Real Madrid': 'https://a.espncdn.com/i/teamlogos/soccer/500/86.png',
    'Real Sociedad': 'https://a.espncdn.com/i/teamlogos/soccer/500/89.png',
    'Sevilla': 'https://a.espncdn.com/i/teamlogos/soccer/500/243.png',
    'Valencia': 'https://a.espncdn.com/i/teamlogos/soccer/500/94.png',
    'Villarreal': 'https://a.espncdn.com/i/teamlogos/soccer/500/102.png',
    'Almería': 'https://a.espncdn.com/i/teamlogos/soccer/500/90.png',
    'Elche CF': 'https://a.espncdn.com/i/teamlogos/soccer/500/3751.png',
    'Elche': 'https://a.espncdn.com/i/teamlogos/soccer/500/3751.png',
    'Espanyol': 'https://a.espncdn.com/i/teamlogos/soccer/500/88.png',
    'RCD Espanyol': 'https://a.espncdn.com/i/teamlogos/soccer/500/88.png',
    'Real Valladolid': 'https://a.espncdn.com/i/teamlogos/soccer/500/95.png',
    'Valladolid': 'https://a.espncdn.com/i/teamlogos/soccer/500/95.png',
    'Leganés': 'https://a.espncdn.com/i/teamlogos/soccer/500/17517.png',
    'Leganes': 'https://a.espncdn.com/i/teamlogos/soccer/500/17517.png',
    // 'Levante': 'https://a.espncdn.com/i/teamlogos/soccer/500/91.png',
    // 'Levante UD': 'https://a.espncdn.com/i/teamlogos/soccer/500/91.png',
    'Eibar': 'https://a.espncdn.com/i/teamlogos/soccer/500/15609.png',

    // NCAAB (Major Teams)
    'Florida St Seminoles': 'https://a.espncdn.com/i/teamlogos/ncaa/500/52.png',
    'Boston College Eagles': 'https://a.espncdn.com/i/teamlogos/ncaa/500/103.png',
    'Purdue Boilermakers': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2509.png',
    'Michigan Wolverines': 'https://a.espncdn.com/i/teamlogos/ncaa/500/130.png',
    'Xavier Musketeers': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2752.png',
    'Villanova Wildcats': 'https://a.espncdn.com/i/teamlogos/ncaa/500/222.png',
    'Ohio State Buckeyes': 'https://a.espncdn.com/i/teamlogos/ncaa/500/194.png',
    'Wisconsin Badgers': 'https://a.espncdn.com/i/teamlogos/ncaa/500/275.png',
    'Duke Blue Devils': 'https://a.espncdn.com/i/teamlogos/ncaa/500/150.png',
    'North Carolina Tar Heels': 'https://a.espncdn.com/i/teamlogos/ncaa/500/153.png',
    'Kansas Jayhawks': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2305.png',
    'Kentucky Wildcats': 'https://a.espncdn.com/i/teamlogos/ncaa/500/96.png',
    'Alabama Crimson Tide': 'https://a.espncdn.com/i/teamlogos/ncaa/500/333.png',
    'Texas Longhorns': 'https://a.espncdn.com/i/teamlogos/ncaa/500/251.png',
    'LSU Tigers': 'https://a.espncdn.com/i/teamlogos/ncaa/500/99.png',
    'UCONN Huskies': 'https://a.espncdn.com/i/teamlogos/ncaa/500/41.png',
    'Connecticut Huskies': 'https://a.espncdn.com/i/teamlogos/ncaa/500/41.png',
    'Arizona Wildcats': 'https://a.espncdn.com/i/teamlogos/ncaa/500/12.png',
    'Houston Cougars': 'https://a.espncdn.com/i/teamlogos/ncaa/500/248.png',
    'Tennessee Volunteers': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2633.png',
    'Auburn Tigers': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2.png',
    'Iowa State Cyclones': 'https://a.espncdn.com/i/teamlogos/ncaa/500/66.png',
    'Baylor Bears': 'https://a.espncdn.com/i/teamlogos/ncaa/500/239.png',
    'Illinois Fighting Illini': 'https://a.espncdn.com/i/teamlogos/ncaa/500/356.png',
    'Gonzaga Bulldogs': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2250.png',
    'Marquette Golden Eagles': 'https://a.espncdn.com/i/teamlogos/ncaa/500/269.png',
    'Creighton Bluejays': 'https://a.espncdn.com/i/teamlogos/ncaa/500/156.png',
    'Florida Gators': 'https://a.espncdn.com/i/teamlogos/ncaa/500/57.png',
    'South Carolina Gamecocks': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2579.png',
    'New Mexico Lobos': 'https://a.espncdn.com/i/teamlogos/ncaa/500/167.png',
    'Mississippi State Bulldogs': 'https://a.espncdn.com/i/teamlogos/ncaa/500/344.png',
    'TCU Horned Frogs': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2628.png',
    'Texas Tech Red Raiders': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2641.png',
    'Saint Mary\'s Gaels': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2540.png',
    'San Diego State Aztecs': 'https://a.espncdn.com/i/teamlogos/ncaa/500/21.png',
    'San Diego St Aztecs': 'https://a.espncdn.com/i/teamlogos/ncaa/500/21.png',
    'Clemson Tigers': 'https://a.espncdn.com/i/teamlogos/ncaa/500/228.png',
    'Oklahoma Sooners': 'https://a.espncdn.com/i/teamlogos/ncaa/500/201.png',
    'Oregon Ducks': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2483.png',
    'Minnesota Golden Gophers': 'https://a.espncdn.com/i/teamlogos/ncaa/500/135.png',
    'Buffalo Bulls': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2084.png',
    'Northern Illinois Huskies': 'https://a.espncdn.com/i/teamlogos/ncaa/500/2459.png',
    'Arizona St Sun Devils': 'https://a.espncdn.com/i/teamlogos/ncaa/500/9.png',

    // Champions League / European Clubs
    'Juventus': 'https://a.espncdn.com/i/teamlogos/soccer/500/111.png',
    'Galatasaray': 'https://a.espncdn.com/i/teamlogos/soccer/500/3635.png',
    'AS Monaco': 'https://a.espncdn.com/i/teamlogos/soccer/500/174.png',
    'Monaco': 'https://a.espncdn.com/i/teamlogos/soccer/500/174.png',
    'Paris Saint Germain': 'https://a.espncdn.com/i/teamlogos/soccer/500/160.png',
    'Paris Saint-Germain': 'https://a.espncdn.com/i/teamlogos/soccer/500/160.png',
    'PSG': 'https://a.espncdn.com/i/teamlogos/soccer/500/160.png',
    'Borussia Dortmund': 'https://a.espncdn.com/i/teamlogos/soccer/500/124.png',
    'Dortmund': 'https://a.espncdn.com/i/teamlogos/soccer/500/124.png',
    // 'Atalanta BC': 'https://a.espncdn.com/i/teamlogos/soccer/500/107.png',
    // 'Atalanta': 'https://a.espncdn.com/i/teamlogos/soccer/500/107.png',
    'Benfica': 'https://a.espncdn.com/i/teamlogos/soccer/500/1633.png',
    'SL Benfica': 'https://a.espncdn.com/i/teamlogos/soccer/500/1633.png',
    'Club Brugge': 'https://a.espncdn.com/i/teamlogos/soccer/500/2344.png',
    'Olympiakos Piraeus': 'https://a.espncdn.com/i/teamlogos/soccer/500/3000.png',
    'Olympiakos': 'https://a.espncdn.com/i/teamlogos/soccer/500/3000.png',
    'Bayer Leverkusen': 'https://a.espncdn.com/i/teamlogos/soccer/500/131.png',
    'Leverkusen': 'https://a.espncdn.com/i/teamlogos/soccer/500/131.png',
    'Inter Milan': 'https://a.espncdn.com/i/teamlogos/soccer/500/110.png',
    'Inter': 'https://a.espncdn.com/i/teamlogos/soccer/500/110.png',
    'AC Milan': 'https://a.espncdn.com/i/teamlogos/soccer/500/103.png',
    'Bayern Munich': 'https://a.espncdn.com/i/teamlogos/soccer/500/132.png',
    'Bayern München': 'https://a.espncdn.com/i/teamlogos/soccer/500/132.png',
    'RB Leipzig': 'https://a.espncdn.com/i/teamlogos/soccer/500/11420.png',
    'Sporting CP': 'https://a.espncdn.com/i/teamlogos/soccer/500/2995.png',
    'Sporting Lisbon': 'https://a.espncdn.com/i/teamlogos/soccer/500/2995.png',
    'Porto': 'https://a.espncdn.com/i/teamlogos/soccer/500/437.png',
    'FC Porto': 'https://a.espncdn.com/i/teamlogos/soccer/500/437.png',
    'Ajax': 'https://a.espncdn.com/i/teamlogos/soccer/500/139.png',
    'AFC Ajax': 'https://a.espncdn.com/i/teamlogos/soccer/500/139.png',
    'Napoli': 'https://a.espncdn.com/i/teamlogos/soccer/500/114.png',
    'SSC Napoli': 'https://a.espncdn.com/i/teamlogos/soccer/500/114.png',
    'Lazio': 'https://a.espncdn.com/i/teamlogos/soccer/500/105.png',
    'SS Lazio': 'https://a.espncdn.com/i/teamlogos/soccer/500/105.png',
    'Roma': 'https://a.espncdn.com/i/teamlogos/soccer/500/104.png',
    'AS Roma': 'https://a.espncdn.com/i/teamlogos/soccer/500/104.png',
    'Feyenoord': 'https://a.espncdn.com/i/teamlogos/soccer/500/143.png',
    'PSV Eindhoven': 'https://a.espncdn.com/i/teamlogos/soccer/500/148.png',
    'PSV': 'https://a.espncdn.com/i/teamlogos/soccer/500/148.png',
    'Celtic': 'https://a.espncdn.com/i/teamlogos/soccer/500/298.png',
    'Celtic FC': 'https://a.espncdn.com/i/teamlogos/soccer/500/298.png',
    'Red Star Belgrade': 'https://a.espncdn.com/i/teamlogos/soccer/500/2710.png',
    'Shakhtar Donetsk': 'https://a.espncdn.com/i/teamlogos/soccer/500/2725.png',
    'Salzburg': 'https://a.espncdn.com/i/teamlogos/soccer/500/13435.png',
    'Red Bull Salzburg': 'https://a.espncdn.com/i/teamlogos/soccer/500/13435.png',
    'Young Boys': 'https://a.espncdn.com/i/teamlogos/soccer/500/2691.png',
    'BSC Young Boys': 'https://a.espncdn.com/i/teamlogos/soccer/500/2691.png',
    'Qarabağ FK': 'https://a.espncdn.com/i/teamlogos/soccer/500/15540.png',
    'Bodø/Glimt': 'https://a.espncdn.com/i/teamlogos/soccer/500/15253.png',
}

// Generate consistent colors from team names for fallback
const getTeamColor = (name: string) => {
    const colors = [
        'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
        'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500',
        'bg-teal-500', 'bg-cyan-500'
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
}

export function getTeamLogoUrl(name: string): string | null {
    // 1. Exact match first (Fastest)
    if (LOGO_MAP[name]) return LOGO_MAP[name]

    // 2. Normalize and check again
    const normalizedName = name.toLowerCase().trim()
    const keys = Object.keys(LOGO_MAP)

    // 3. Strict Fuzzy Matching
    // Goal: "Texas" should match "Texas Longhorns", but "Florida" shouldn't match "Florida State" if we have both.
    const match = keys.find(k => {
        const kn = k.toLowerCase()
        // Exact normalized match
        if (kn === normalizedName) return true
        // If input is "Florida St", and key is "Florida St Seminoles"
        if (kn.startsWith(normalizedName) && kn.length < normalizedName.length + 12) return true
        // If key is "Texas" and input is "Texas Longhorns"
        if (normalizedName.startsWith(kn) && normalizedName.length < kn.length + 12) return true
        return false
    })

    if (match) return LOGO_MAP[match]

    // 4. Fallback: Heuristic for NCAA / EPL logos if we don't have them in map
    // (This is risky but helps with NCAAB depth)
    // Most NCAAB logos follow a predictable ID pattern on ESPN if we had the ID, 
    // but we don't here. So we stick to symbols for now.

    return null
}

export function TeamLogo({ name, className = "w-8 h-8" }: { name: string, className?: string }) {
    const [error, setError] = useState(false)
    const url = getTeamLogoUrl(name)

    if (url && !error) {
        return (
            <div className={`relative ${className} flex items-center justify-center`}>
                <Image
                    src={url}
                    alt={name}
                    fill
                    className="object-contain"
                    onError={() => {
                        console.error(`[TeamLogo] Failed to load: ${url}`)
                        setError(true)
                    }}
                    unoptimized
                />
            </div>
        )
    }

    // Fallback to Initials
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    const colorClass = getTeamColor(name)

    return (
        <div className={`${className} rounded-full ${colorClass} bg-opacity-20 text-white flex items-center justify-center text-[10px] font-bold shadow-inner ring-1 ring-white/10`}>
            {initials}
        </div>
    )
}
