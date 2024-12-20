window.addEventListener("load", () => {
    let page = performance.mark("pageEnd");
    let time = "Загрузка страницы завершена за " + page.startTime.toFixed() + " мс"

    let footer = document.querySelector("footer")

    let div = document.createElement("div")
    div.textContent = time
    footer.appendChild(div)
})

