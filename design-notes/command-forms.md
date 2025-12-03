
# Command formats:

data json: {
	"author": "John Smith",
	"year": 2024,
	"published": true,
	"tags": [
		"example",
		"test"
	],
	"nested": {
		"level1": {
			"level2":"value"
		}
	}
}
compact data json: {"author":"John Smith","year":2024,"published":true,"tags":["example","test"],"nested":{"level1":{"level2":"value"}}}
compact data json simple only: {"author":"John Smith","year":2024,"published":true}



## Basic obsidian URI (doesn't support arrays or nested objects) (URI encoded compact data json simple only)
obsidian://z2k-templates?vault=Templates%20Test%20Vault%20-%20Primary&cmd=new&templatePath=Tests%2FExample%2Ftemplate.md&destDir=Tests%2FExample&fileTitle=output&finalize=true&author=John%20Smith&year=2024&published=true

## URI (url encoded compact data json)
obsidian://z2k-templates?vault=Templates%20Test%20Vault%20-%20Primary&cmd=new&templatePath=Tests%2FExample%2Ftemplate.md&destDir=Tests%2FExample&fileTitle=output&finalize=true&templateJsonData=%7B%22author%22%3A%22John%20Smith%22%2C%22year%22%3A2024%2C%22published%22%3Atrue%2C%22tags%22%3A%5B%22example%22%2C%22test%22%5D%2C%22nested%22%3A%7B%22level1%22%3A%7B%22level2%22%3A%22value%22%7D%7D%7D

## URI (base64 encoded compact data json)
obsidian://z2k-templates?vault=Templates%20Test%20Vault%20-%20Primary&cmd=new&templatePath=Tests%2FExample%2Ftemplate.md&destDir=Tests%2FExample&fileTitle=output&finalize=true&templateJsonData64=eyJhdXRob3IiOiJKb2huIFNtaXRoIiwieWVhciI6MjAyNCwicHVibGlzaGVkIjp0cnVlLCJ0YWdzIjpbImV4YW1wbGUiLCJ0ZXN0Il0sIm5lc3RlZCI6eyJsZXZlbDEiOnsibGV2ZWwyIjoidmFsdWUifX19



## Command in single json file (form 1)
{
	"cmd": "new",
	"templatePath": "Tests/Example/template.md",
	"destDir": "Tests/Example",
	"fileTitle": "output",
	"finalize": true,
	"author": "John Smith",
	"year": 2024,
	"published": true,
	"tags": [
		"example",
		"test"
	],
	"nested": {
		"level1": {
			"level2":"value"
		}
	}
}

## Command in single json file (form 2)
{
	"cmd": "new",
	"templatePath": "Tests/Example/template.md",
	"destDir": "Tests/Example",
	"fileTitle": "output",
	"finalize": true,
	"templateJsonData": "%7B%22author%22%3A%22John%20Smith%22%2C%22year%22%3A2024%2C%22published%22%3Atrue%2C%22tags%22%3A%5B%22example%22%2C%22test%22%5D%2C%22nested%22%3A%7B%22level1%22%3A%7B%22level2%22%3A%22value%22%7D%7D%7D"
}

## Command in single json file (form 3) (new variant, json object for templateJsonData)
{
	"cmd": "new",
	"templatePath": "Tests/Example/template.md",
	"destDir": "Tests/Example",
	"fileTitle": "output",
	"finalize": true,
	"templateJsonData": {
		"author": "John Smith",
		"year": 2024,
		"published": true,
		"tags": [
			"example",
			"test"
		],
		"nested": {
			"level1": {
				"level2":"value"
			}
		}
	}
}



## Command in jsonl file (form 1)
...
{"cmd":"new","templatePath":"Tests/Example/template.md","destDir":"Tests/Example","fileTitle":"output","finalize":true,"author":"John Smith","year":2024,"published":true,"tags":["example","test"],"nested":{"level1":{"level2":"value"}}}
...

## Command in jsonl file (form 2)
...
{"cmd":"new","templatePath":"Tests/Example/template.md","destDir":"Tests/Example","fileTitle":"output","finalize":true,"templateJsonData":"%7B%22author%22%3A%22John%20Smith%22%2C%22year%22%3A2024%2C%22published%22%3Atrue%2C%22tags%22%3A%5B%22example%22%2C%22test%22%5D%2C%22nested%22%3A%7B%22level1%22%3A%7B%22level2%22%3A%22value%22%7D%7D%7D"}
...

## Command in jsonl file (form 3)
...
{"cmd":"new","templatePath":"Tests/Example/template.md","destDir":"Tests/Example","fileTitle":"output","finalize":true,"templateJsonData":{"author":"John Smith","year":2024,"published":true,"tags":["example","test"],"nested":{"level1":{"level2":"value"}}}}
...



## Uri with json cmd (form 1)
obsidian://z2k-templates?vault=Templates%20Test%20Vault%20-%20Primary&cmd=json&json=%7B%22cmd%22%3A%22new%22%2C%22templatePath%22%3A%22Tests%2FExample%2Ftemplate.md%22%2C%22destDir%22%3A%22Tests%2FExample%22%2C%22fileTitle%22%3A%22output%22%2C%22finalize%22%3Atrue%2C%22author%22%3A%22John%20Smith%22%2C%22year%22%3A2024%2C%22published%22%3Atrue%2C%22tags%22%3A%5B%22example%22%2C%22test%22%5D%2C%22nested%22%3A%7B%22level1%22%3A%7B%22level2%22%3A%22value%22%7D%7D%7D

## Uri with base64 encoded json cmd (form 1)
obsidian://z2k-templates?vault=Templates%20Test%20Vault%20-%20Primary&cmd=json&json64=eyJjbWQiOiJuZXciLCJ0ZW1wbGF0ZVBhdGgiOiJUZXN0cy9FeGFtcGxlL3RlbXBsYXRlLm1kIiwiZGVzdERpciI6IlRlc3RzL0V4YW1wbGUiLCJmaWxlVGl0bGUiOiJvdXRwdXQiLCJmaW5hbGl6ZSI6dHJ1ZSwiYXV0aG9yIjoiSm9obiBTbWl0aCIsInllYXIiOjIwMjQsInB1Ymxpc2hlZCI6dHJ1ZSwidGFncyI6WyJleGFtcGxlIiwidGVzdCJdLCJuZXN0ZWQiOnsibGV2ZWwxIjp7ImxldmVsMiI6InZhbHVlIn19fQ


