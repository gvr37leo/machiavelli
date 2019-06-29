var boardhtml = `<div>
    <div style="display: flex;" id="opponentcontainer">
            
    </div>
    <div>
        <div id="board" style="display: flex; justify-content: center;">
            
        </div>
        <div class="handandinfo" style="display: flex">
            <div class="info">
                <div>
                    <img id="crownicon" width="30" height="30" src="/res/crown-solid.svg" alt="">
                </div>
                <div id="coincontainer" style="display: flex; align-items: center;">
                    <img width="30" height="30" src="/res/coins-solid.svg" alt="">
                    <span id="coins" style="font-size: 25px;"></span>
                </div>
                <div id="ownroles">
                </div>
                <div id="murderedrole">
                </div>
                <div id="muggedrole">
                </div>
            </div>
            <div id="hand" style="display: flex; justify-content: center; flex-grow: 1;">
            </div>
        </div>
    </div>

    <div style="border:1px solid black; padding: 10px; margin: 10px;">
        <div id="discoverdescription" style="text-align: center;">
        </div>
        <div id="discoverContainer" style="display: flex; justify-content: center;">
            
        </div>
    </div>

    <button id="endturnbutton" class="endturnbutton" style=>
        end turn
    </button>
</div>`