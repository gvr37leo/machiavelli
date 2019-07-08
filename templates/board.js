var boardhtml = `<div>
    <div style="display:flex;">
        <div>
            <div class="pamabo">
                <div>
                    <img id="crownicon" width="30" height="30" src="/res/crown-solid.svg" alt="">
                </div>
                <div id="coincontainer" style="display: flex; align-items: center;">
                    <img width="30" height="30" src="/res/coins-solid.svg" alt="">
                    <span id="coins" style="font-size: 25px;"></span>
                </div>
            </div>
            <div class="pamabo">
                <div>huidig spelende rol</div>
                <div id="currentRoleTurn">
                </div>
            </div>
            <div class="pamabo">
                <div>jouw rollen</div>
                <div id="ownroles">
                </div>
            </div>
            <div class="pamabo">
                <div>vermoorde rol</div>
                <div id="murderedrole">
                </div>
            </div>
            <div class="pamabo">
                <div>bestolen rol</div>
                <div id="muggedrole">
                </div>
            </div>
            <div class="pamabo">
                <div>inactieve rollen</div>
                <div id="inactiveroles">
                </div>
            </div>
        </div>
        <div style="flex-grow:1;">
            <div style="display: flex; justify-content:center;" id="opponentcontainer">
                    
            </div>
            <div>
                <div class="pamabo">
                    <div style="text-align:center">jouw gebouwen</div>
                    <div id="board" style="display: flex; justify-content: center;">
                        
                    </div>
                </div>
                <div class="handandinfo" style="display: flex; align-items: flex-start;">
                    
                    <div class="pamabo" style="flex-grow: 1;">
                        <div style="text-align:center">jouw kaarten</div>
                        <div id="hand" style="display: flex; justify-content: center; flex-grow: 1;">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div id="discoverabsdiv" style="position:absolute; left:50%; top: 37%;">
        <div style="border: 1px solid black;padding: 10px;margin: 10px;position: relative;left: -50%;top: -50%;background-color: white;">
            <div id="discoverdescription" style="text-align: center;">
            </div>
            <div id="discoverContainer" style="display: flex; justify-content: center;">
                
            </div>
        </div>
    </div>

    <div id="selectabsdiv" style="position:absolute; left:50%; top: 37%;">
        <div style="border: 1px solid black;padding: 10px;margin: 10px;position: relative;left: -50%;top: -50%;background-color: white;">
            <div id="selectdescription" style="text-align: center;">
            </div>
            <div id="selectContainer" style="display: flex; justify-content: center;">
                
            </div>
            <button type="button" id="confirmbutton">confirm</button>
        </div>
    </div>

    <button id="endturnbutton" class="endturnbutton" style=>
        end turn
    </button>
</div>`
