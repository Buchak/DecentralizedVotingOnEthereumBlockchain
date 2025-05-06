// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PollContract {
    struct Poll {
        uint id;
        string question;
        string[] options;
        uint[] votes;
        address creator;
        bool isprivate;
        bool active;
    }

    uint public totalPolls;
    mapping(uint => Poll) public polls;
    mapping(address =>  mapping(uint => bool)) public alreadyVoted;
    mapping(uint => mapping(address => bool)) public Whitelist;

    function addToWhitelist(uint _pollId, address [] memory _voters) public {
        require(polls[_pollId].creator == msg.sender, unicode"Only the poll creator can add to the whitelist");
        require(_voters.length <= 100, "You cannot whitelist more than 100 members at a time. Add more later.");

        for (uint i = 0; i < _voters.length; i++) {
            Whitelist[_pollId][_voters[i]] = true;
        }
    }

    function deleteAddressFromWhitelist(uint _pollId, address [] calldata _voters) public {
        require(polls[_pollId].creator == msg.sender, unicode"Only the poll creator can delete from whitelist");
        
        for (uint i = 0; i < _voters.length; i++) {
            if (!Whitelist[_pollId][_voters[i]]) continue;
                delete Whitelist[_pollId][_voters[i]];
        }
    }

    function createPoll(string memory _question, string[] memory _options, bool _isprivate, address[] calldata _voters) public {
        require(bytes(_question).length > 0, "The question cannot be empty!");
        require(_options.length > 1, "There must be at least 2 answer options!");
        require(_voters.length <= 100, "You cannot add more than 100 participants to the Whitelist at a time. You can add after creating the poll.");

        uint pollId = totalPolls;

        Poll memory newPoll = Poll({
            id: pollId,
            question: _question,
            options: _options,
            votes: new uint[](_options.length),
            creator: msg.sender,
            isprivate: _isprivate,
            active: true
        });

        polls[pollId] = newPoll;
        totalPolls++;

        if (_isprivate == true) {
            address[] memory voters = new address[](1);
            voters[0] = msg.sender;
            addToWhitelist(pollId, voters);

            for (uint i = 0; i < _voters.length; i++) {
                Whitelist[pollId][_voters[i]] = true;
            }
        }
    }

    function closePoll(uint _id) public {
        require(polls[_id].creator == msg.sender, "Only the poll creator can close a Poll!");

        polls[_id].active = false;
    }

    function getAllPolls(uint _start, uint _limit) public view returns (uint[] memory, string[] memory) {
        uint totalAvailable = 0;
        
        for (uint i = 0; i < totalPolls; i++) {
            if (polls[i].active == true) {
                if (polls[i].isprivate == false) {
                    totalAvailable++;
                } else if (polls[i].isprivate == true && Whitelist[i][msg.sender] == true) {
                    totalAvailable++;
                }
            }
        }

        if (_start >= totalAvailable) {
            return (new uint[](0), new string[](0));
        }

        uint remaining = totalAvailable - _start;
        uint pageSize = _limit < remaining ? _limit : remaining;

        uint[] memory ids = new uint[](pageSize);
        string[] memory questions = new string[](pageSize);

        uint currentIndex = 0;
        uint pageIndex = 0;

        for (uint i = 0; i < totalPolls && pageIndex < pageSize; i++) {
        if (polls[i].active == true) {
            if (polls[i].isprivate == false || (polls[i].isprivate == true && Whitelist[i][msg.sender] == true)) {
                if (currentIndex >= _start) {
                    ids[pageIndex] = polls[i].id;
                    questions[pageIndex] = polls[i].question;
                    pageIndex++;
                }
                currentIndex++;
            }
        }
    }
        return (ids, questions);
    }

    function getPoll(uint _id) public view returns (uint, string memory, string[] memory, bool, bool, uint[] memory) {
        require(_id < totalPolls, "Such a poll does not exist!");

        bool isowner = false;

        if (polls[_id].creator == msg.sender) {
            isowner = true;
        }

        return (
            polls[_id].id, 
            polls[_id].question,
            polls[_id].options,
            isowner,
            polls[_id].isprivate,
            polls[_id].votes
        );
    }

    function getOwnerPoll() public view returns(uint[] memory, string[] memory) {
        uint totalAvailable = 0;
        uint index = 0;

        for (uint i = 0; i < totalPolls; i++) {
            if (polls[i].creator == msg.sender) {
                totalAvailable++;
            }
        }

        uint[] memory ids = new uint[](totalAvailable);
        string[] memory questions = new string[](totalAvailable);

        for (uint i = 0; i < totalPolls; i++) {
            if (polls[i].creator == msg.sender) {
                ids[index] = polls[i].id;
                questions[index] = polls[i].question;
                index++;
            }
        }

        return(ids, questions);
    }
    
    function vote(uint _idPoll, uint _optionId) public {
        require(_idPoll < totalPolls, "Such a poll does not exist!");
        require(_optionId >= 0 && _optionId < polls[_idPoll].options.length, "There is no such answer!");
        require(alreadyVoted[msg.sender][_idPoll] == false, "You have already voted in this poll!");
        require(polls[_idPoll].active == true, "This poll has been deactivated!");

        if (polls[_idPoll].isprivate == true) {
            require(Whitelist[_idPoll][msg.sender] == true, "You are not whitelisted to vote for this poll!");
        }

        polls[_idPoll].votes[_optionId]++;

        alreadyVoted[msg.sender][_idPoll] = true;
    }

    function getPollIsActive(uint _pollId) public view returns (bool) {
        return polls[_pollId].active;
    }

    function hasVoted(uint _pollId) public view returns (bool) {
        return alreadyVoted[msg.sender][_pollId];
    }
}