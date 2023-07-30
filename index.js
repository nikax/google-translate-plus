let newWords = {}

const savePhrase = () => {
    const url = new URL(window.location.href)
    const sourceLang = url.searchParams.get('sl').trim()
    const destLang = url.searchParams.get('tl').trim()

    const translationNode = document.querySelector(`span[lang=${destLang}]`)
    const phrase = translationNode.innerText
    if (phrase) {
        const sourcePhrase = url.searchParams.get('text').trim()
        const params = {
            source_phrase: sourcePhrase,
            source_lang: sourceLang,
            translated_phrase: phrase,
            translated_lang: destLang
        }
        if (Object.values(newWords).length > 0) {
            params.new_words = newWords
            newWords = {}
        }
        if (sourcePhrase) {
            fetch('http://127.0.0.1:7777/save-phrase', {
                method: 'POST',
                body: JSON.stringify(params)
            })
        }
    }
}

const observeNewWords = () => {
    const observer = new MutationObserver(mutations => {
        let newWordNode = null
        outer:
        for (let mutation of mutations) {
            for (let addedNode of mutation.addedNodes) {
                if (addedNode.innerText && addedNode.innerText.indexOf('Translations of') > -1) {
                    newWordNode = addedNode
                    break outer
                }
            }
        }
        if (newWordNode) {
            const newWordSpan = newWordNode.querySelector('span')
            const url = new URL(window.location.href)
            const sourceLang = url.searchParams.get('sl').trim()
            if (newWordSpan) {
                const newWord = newWordSpan.innerText.trim()
                if (newWord) {
                    const translationSpans = document.querySelectorAll(`span[data-tl=${sourceLang}]`)
                    if (translationSpans.length > 0) {
                        const translations = []
                        translationSpans.forEach(el => {
                            translations.push(el.innerText)
                        })
                        newWords[newWord] = translations
                    }
                }
            }
        }
    })

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
    })
}

const addSaveBtn = () => {
    const donorBtn = document.querySelector('button[aria-label="Website translation"]')

    const saveBtn = donorBtn.cloneNode(true)
    saveBtn.style.marginLeft = '7px'
    saveBtn.innerText = 'Save'

    saveBtn.addEventListener('click', e => {
        e.stopImmediatePropagation()
        savePhrase()
    })

    donorBtn.parentNode.appendChild(saveBtn)

}

addSaveBtn()
observeNewWords()