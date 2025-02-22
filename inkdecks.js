// INKDECKS STAPLES

let Staples = {}

function GetStaples(page) {
	const url = "https://inkdecks.com/staples?page="+page
	$.get( url, function(html) {
		const $html = $(html);
		const cardbody = $html.find('.card-body')[1];
		
		const rows = $(cardbody).find('div.row')
		.filter(function() {
			return $(this).attr('class') === 'row';
		});

		var lastPopularity = 100

		rows.each((i, rowHtml) => {
			const cards = $(rowHtml).find('div.col-xl-3');
			
			cards.each((i, cardHtml) => {
				const cardnameb = $(cardHtml).find('b.text-white');
				const cardname = cardnameb.html().trim();
				const nametitle = cardname.split(' - ');
				var name, title = ""

				if (nametitle.length === 2) {
					name = nametitle[0]
					title = nametitle[1]
				} else {
					name = nametitle[0]
				}

				const popspan = $(cardHtml).find('div.text-rainbow').find('span');
				const popularity = popspan.html().trim()

				if (popularity > 0) {
					Staples[cardname] = ({'name': name, 'title': title, 'popularity': popularity})
				}
				lastPopularity = popularity
			})
		})

		if (lastPopularity > 0) {
			GetStaples(page+1)
		} else {
			GetAllCards()
		}
	})
}

// LORCAST CARD INFO

let CARD_INFO_API_ENDPOINTS = "https://api.lorcast.com/v0/cards/search?q="
let SETS_API_ENDPOINTS = "https://api.lorcast.com/v0/sets"

let Cards = {}

function GetAllCards() {
  $.get( SETS_API_ENDPOINTS, function(json) {
    $(json.results).each((i, set) => {
      GetAllCardsForSet(set.code)
    })
  }, 'json')
}

function GetAllCardsForSet(Set) {
  const url = CARD_INFO_API_ENDPOINTS + "+set:" + Set
  $.get(url, function (json) {
    $(json.results).each((i, card) => {
      if (!(Set in Cards)) {
        Cards[Set] = {}
      }
      if (!(card["collector_number"] in Cards[Set])) {

        var staplesKey = card["name"]
        if ("version" in card) {
          staplesKey += " - " + card["version"]
        }

        if (staplesKey in Staples) {
          card["popularity"] = Staples[staplesKey]["popularity"]
        }

        Cards[Set][card["collector_number"]] = card
      }
    })

    $("#staples").append(JSON.stringify(Cards));

  }, 'json')
}

// FETCH INFO

GetStaples(1)

